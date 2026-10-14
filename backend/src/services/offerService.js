const { randomUUID } = require("crypto");

const offers = [];

function getAllOffers() {
  return offers;
}

function getOfferById(id) {
  return offers.find(offer => offer.offerId === id);
}

function createOffer(data) {
  const offer = {
    offerId: randomUUID(),
    applicationId: data.applicationId,
    offerDate: data.offerDate,
    salary: data.salary,
    offerStatus: "Pending",
    responseDeadline: data.responseDeadline
  };

  offers.push(offer);
  return offer;
}

function updateOffer(id, data) {
  const offer = getOfferById(id);
  if (!offer) return null;

  const allowed = [
    "offerDate",
    "salary",
    "offerStatus",
    "responseDeadline"
  ];

  for (const field of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      offer[field] = data[field];
    }
  }

  return offer;
}

function deleteOffer(id) {
  const index = offers.findIndex(
    offer => offer.offerId === id
  );

  if (index === -1) return false;

  offers.splice(index, 1);
  return true;
}

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
};