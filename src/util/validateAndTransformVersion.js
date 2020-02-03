const log = require("./log.js");

/**
 * @summary Given some variable "version", ensures it's either
 *   a number or a string, transforms it to the standard string
 *   version format, and validates that it's acceptable.
 * @param {String|Number} version Version identifier
 * @returns {String|null} Cleaned and valid version, or `null`
 *   if invalid
 */
function validateAndTransformVersion(version, firstNumberMinimum = 1) {
  if (typeof version !== "string" && typeof version !== "number") {
    log(`Version "${version}" is not a string or a number`, "error");
    return null;
  }

  const stringVersion = String(version);
  if (stringVersion === "NaN" || stringVersion === "") {
    log(`Version "${stringVersion}" is not a number`, "error");
    return null;
  }

  const versionPieces = stringVersion.split("-");
  if (versionPieces.length > 2) {
    log(`Version "${version}" has more than one dash in it`, "error");
    return null;
  }

  const [firstPiece, secondPiece = "0"] = versionPieces;

  const firstNumber = Number(firstPiece);
  if (isNaN(firstNumber) || !Number.isInteger(firstNumber)) {
    log(`The major version "${firstPiece}" of version "${version}" is not an integer`, "error");
    return null;
  }

  const secondNumber = Number(secondPiece);
  if (isNaN(secondNumber) || !Number.isInteger(secondNumber)) {
    log(`The minor version "${secondPiece}" of version "${version}" is not an integer`, "error");
    return null;
  }

  if (firstNumber < firstNumberMinimum) {
    log(`The major version "${firstNumber}" of version "${version}" is less than the minimum of ${firstNumberMinimum}`, "error");
    return null;
  }

  if (secondNumber < 0) {
    log(`The minor version "${secondNumber}" of version "${version}" is less than the minimum of 0`, "error");
    return null;
  }

  return `${firstNumber}-${secondNumber}`;
}

module.exports = validateAndTransformVersion;
