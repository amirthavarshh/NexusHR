const bcrypt = require('bcryptjs');
const hash = "$2a$10$p4arF8jFvuvEtGL3JU/TzOGxQ3u5YYI3OtqItcZhn3GtJlWFvqobG";
const match = bcrypt.compareSync("manager123", hash);
console.log("manager123 matches:", match);
const match2 = bcrypt.compareSync("password", hash);
console.log("password matches:", match2);
