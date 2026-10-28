
const service = require("../services/offerService");
const applicationService = require("../services/applicationService");

const validStatuses = ["Pending", "Accepted", "Declined"];

// Validate salary
function parseSalary(salary) {
  if (
    typeof salary !== "number" &&
    typeof salary !== "string"
  ) {
    return null;
  }

  if (typeof salary === "string" && salary.trim() === "") {
    return null;
  }

  const amount = Number(salary);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return amount;
}

// Validate date
function validDate(date) {
  return typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date));
}

// Automatically update application status to Offer
async function updateApplicationToOffer(applicationId) {
  const application =
    await applicationService.getApplicationById(applicationId);

  if (!application) {
    throw new Error("Linked application not found");
  }

  if (application.status !== "Offer") {
    await applicationService.updateApplication(
      applicationId,
      { status: "Offer" }
    );
  }
}

// GET ALL OFFERS
exports.getAll = async (req, res) => {
  try {
    const offers = await service.getAllOffers(
      req.query.applicationId
    );

    res.json(offers);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch offers"
    });
  }
};

// GET OFFER BY ID
exports.getById = async (req, res) => {
  try {
    const offer = await service.getOfferById(
      req.params.id
    );

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    res.json(offer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch offer"
    });
  }
};

// CREATE OFFER
exports.create = async (req, res) => {
  try {
    const {
      applicationId,
      offerDate,
      salary,
      responseDeadline,
      offerStatus = "Pending"
    } = req.body;

    // Validate required fields
    if (
      !applicationId ||
      !offerDate ||
      salary === undefined ||
      salary === null ||
      !responseDeadline
    ) {
      return res.status(400).json({
        message:
          "applicationId, offerDate, salary, and responseDeadline are required"
      });
    }

    // Validate salary
    const parsedSalary = parseSalary(salary);

    if (parsedSalary === null) {
      return res.status(400).json({
        message: "Salary must be a non-negative number"
      });
    }

    // Validate dates
    if (
      !validDate(offerDate) ||
      !validDate(responseDeadline)
    ) {
      return res.status(400).json({
        message: "Invalid offer date or response deadline"
      });
    }

    // Validate status
    if (!validStatuses.includes(offerStatus)) {
      return res.status(400).json({
        message: "Invalid offer status"
      });
    }

    // Verify application exists
    const application =
      await applicationService.getApplicationById(
        applicationId
      );

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Create offer
    const offer = await service.createOffer({
      applicationId,
      offerDate,
      salary: parsedSalary,
      responseDeadline,
      offerStatus
    });

    // NEW: Automatically update application status
    await updateApplicationToOffer(applicationId);

    res.status(201).json(offer);

  } catch (error) {
    console.error("Create offer error:", error);

    res.status(500).json({
      message: "Failed to create offer or update application status"
    });
  }
};

// UPDATE OFFER
exports.update = async (req, res) => {
  try {
    const {
      offerStatus,
      salary,
      offerDate,
      responseDeadline
    } = req.body;

    // Validate offer status
    if (
      offerStatus !== undefined &&
      !validStatuses.includes(offerStatus)
    ) {
      return res.status(400).json({
        message: "Invalid offer status"
      });
    }

    const updateData = { ...req.body };

    // Validate salary
    if (salary !== undefined) {
      const parsedSalary = parseSalary(salary);

      if (parsedSalary === null) {
        return res.status(400).json({
          message: "Invalid salary"
        });
      }

      updateData.salary = parsedSalary;
    }

    // Validate dates
    if (
      (offerDate !== undefined &&
        !validDate(offerDate)) ||
      (responseDeadline !== undefined &&
        !validDate(responseDeadline))
    ) {
      return res.status(400).json({
        message: "Invalid offer date or response deadline"
      });
    }

    // Update offer
    const offer = await service.updateOffer(
      req.params.id,
      updateData
    );

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    // NEW: Synchronize application status
    await updateApplicationToOffer(
      offer.applicationId
    );

    res.json(offer);

  } catch (error) {
    console.error("Update offer error:", error);

    res.status(500).json({
      message: "Failed to update offer or application status"
    });
  }
};

// DELETE OFFER
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteOffer(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    res.json({
      message: "Offer deleted successfully"
    });

  } catch (error) {
    console.error("Delete offer error:", error);

    res.status(500).json({
      message: "Failed to delete offer"
    });
  }
};
