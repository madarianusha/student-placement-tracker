const service = require("../services/offerService");
const applicationService = require("../services/applicationService");

const validStatuses = ["Pending", "Accepted", "Declined"];

exports.getAll = (req, res) => {
  res.json(service.getAllOffers());
};

exports.getById = (req, res) => {
  const offer = service.getOfferById(req.params.id);

  if (!offer) {
    return res.status(404).json({
      message: "Offer not found"
    });
  }

  res.json(offer);
};

exports.create = (req, res) => {
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

  if (!applicationService.getApplicationById(applicationId)) {
    return res.status(404).json({
      message: "Application not found"
    });
  }

  if (typeof salary !== "number" ||
      !Number.isFinite(salary) || salary < 0) {
    return res.status(400).json({
      message: "Salary must be a non-negative number"
    });
  }

  const offer = service.createOffer({
    applicationId,
    offerDate,
    salary,
    responseDeadline
  });

  res.status(201).json(offer);
};

exports.update = (req, res) => {
  const { offerStatus, salary } = req.body;

  if (offerStatus !== undefined &&
      !validStatuses.includes(offerStatus)) {
    return res.status(400).json({
      message: "Invalid offer status"
    });
  }

  if (salary !== undefined &&
      (typeof salary !== "number" ||
       !Number.isFinite(salary) || salary < 0)) {
    return res.status(400).json({
      message: "Invalid salary"
    });
  }

  const offer = service.updateOffer(req.params.id, req.body);

  if (!offer) {
    return res.status(404).json({
      message: "Offer not found"
    });
  }

  res.json(offer);
};

exports.remove = (req, res) => {
  const deleted = service.deleteOffer(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      message: "Offer not found"
    });
  }

  res.json({
    message: "Offer deleted successfully"
  });
};