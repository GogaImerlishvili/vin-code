const vinValidation = require('vin-validator')
const vendors = ['carfax', 'autocheck']
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

export const validateMail = (mail: string) => Boolean(mail.match(emailRegex))

export const validateVincode = (vincode: string) =>
  vinValidation.validate(vincode)

export const validateVendor = (vendor: string) => vendors.includes(vendor)
