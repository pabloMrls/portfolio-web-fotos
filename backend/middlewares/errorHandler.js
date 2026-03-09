// export function errorHandler(err, req, res, next) {

//   const status = err.status || 500;
//   const isProduction = process.env.NODE_ENV === "production";

//   if (!isProduction) {
//     console.error(err);
//   }

//   res.status(status).json({
//     error: isProduction && status === 500
//       ? "Error interno del servidor"
//       : err.message
//   });
// }

export function errorHandler(err, req, res, next) {

  console.error("ERROR REAL:", err);

  res.status(err.status || 500).json({
    error: err.message
  });
}