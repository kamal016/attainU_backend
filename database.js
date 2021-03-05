const Pool = require("pg").Pool; 
const pool  = new Pool({
  user : 'postgres',
  host: 'postgres.cn5njhghnkhc.us-east-2.rds.amazonaws.com',
  database: 'assignment',
  password:'kamal016',
  port:'5432',
});


module.exports = pool;