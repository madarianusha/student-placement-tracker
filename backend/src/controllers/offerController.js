
const service = require("../services/offerService");
const applicationService = require("../services/applicationService");

const validStatuses = ["Pending", "Accepted", "Declined"];

function validSalary(salary) {
  return typeof salary === "number" &&
    Number.isFinite(salary) &&
    salary >= 0;
}

function validDate(date) {
  return typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !Number.isNaN(Date.parse(date));
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
    const offer = await service.getOfferById(req.params.id);

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
      responseDeadline
    } = req.body;

    if (!applicationId || !offerDate ||
        salary === undefined || !responseDeadline) {
      return res.status(400).json({
        message: "applicationId, offerDate, salary, and responseDeadline are required"
      });
    }

    if (!validSalary(salary)) {
      return res.status(400).json({
        message: "Salary must be a non-negative number"
      });
    }

    if (!validDate(offerDate) ||
        !validDate(responseDeadline)) {
      return res.status(400).json({
        message: "Invalid offer date or response deadline"
      });
    }

    const application =
      await applicationService.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    const offer = await service.createOffer({
      applicationId,
      offerDate,
      salary,
      responseDeadline
    });

    res.status(201).json(offer);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create offer"
    });
  }
};

// UPDATE OFFER
exports.update = async (req, res) => {
  try {
    const { offerStatus, salary, offerDate, responseDeadline } =
      req.body;

    if (offerStatus !== undefined &&
        !validStatuses.includes(offerStatus)) {
      return res.status(400).json({
        message: "Invalid offer status"
      });
    }

    if (salary !== undefined && !validSalary(salary)) {
      return res.status(400).json({
        message: "Invalid salary"
      });
    }

    if ((offerDate !== undefined && !validDate(offerDate)) ||
        (responseDeadline !== undefined &&
         !validDate(responseDeadline))) {
      return res.status(400).json({
        message: "Invalid offer date or response deadline"
      });
    }

    const offer = await service.updateOffer(
      req.params.id,
      req.body
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
      message: "Failed to update offer"
    });
  }
};

// DELETE OFFER
exports.remove = async (req, res) => {
  try {
    const deleted = await service.deleteOffer(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Offer not found"
      });
    }

    res.json({
      message: "Offer deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete offer"
    });
  }
};
