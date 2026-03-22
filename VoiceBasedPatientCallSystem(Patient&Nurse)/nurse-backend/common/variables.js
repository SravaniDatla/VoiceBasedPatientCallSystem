const BackEndURL = process.env.MONGO_URI;
const MongoPort = Number(process.env.PORT) || 3000;

if (!BackEndURL) {
  throw new Error("MONGO_URI is not configured. Set it to your remote MongoDB URI.");
}

const SuccessCode = 200;
const CreatedSuccessCode = 201;
const ServerErrorCode = 500;
const BadRequest = 400;
const Unautherized = 401;
const NotFound = 404;



module.exports = {
   BackEndURL,
    MongoPort,
    SuccessCode,
    CreatedSuccessCode,
    ServerErrorCode,
    BadRequest,
    Unautherized,
    NotFound,
  };