const connection = require("./db/connection");
const inquirer = require("inquirer");

function trackerActions () {

    inquirer
        .prompt([
            {
                message: "What would you like to do?",
                type: "list",
                name: "action",
                choices: [
                    "View Departments",
                    "View Roles",
                    "View Employees",
                    "Add New Department",
                    "Add New Role",
                    "Add New Employee",
                    "Update Employee Roles",
                    "Exit"
                ]
            }
        ])
        .then ((response) => {

            if (response.action === "View Departments") {
                viewDepartments();
            } else if (response.action === "View Roles") {
                viewRoles();
            } else if (response.action === "View Employees") {
                viewEmployees();
            } else if (response.action === "Add New Department") {
                addDepartment();
            } else if (response.action === "Add New Role") {
                addRole();
            } else if (response.action === "Add New Employee") {
                addEmployee();
            } else if (response.action === "Update Employee Roles") {
                updateEmployeeRoles();
            } else if (response.action === "Exit") {
                process.exit();
            }

        });

};



// Add Department, Role, Employee
function addDepartment () {

    inquirer
        .prompt([
            {
                message: "What is the department's name?",
                type: "input",
                name: "departmentName",
            }            
        ])
        .then((response) => {

            connection.query("INSERT INTO department (name) VALUES (?)", response.departmentName, (err, result) => {

                if (err) throw err;

                console.log("Insert as ID" + result.insertId);

                trackerActions();

            })            

        })       

};

function addRole () {

    connection.query("SELECT * FROM department", (err, results) => {

        if (err) throw err;

        inquirer
            .prompt([
                {
                    message: "What is the title?",
                    type: "input",
                    name: "title",
                },
                { 
                    message: "What is the salary?",
                    type: "input",
                    name: "salary",
                },
                {
                    message: "What is the department's name?",
                    type: "list",
                    name: "department_id",
                    choices: results.map ( department => {                        
                        return {
                            name: department.name,
                            value: department.id
                        };                                 
                    })
                }             
            ])
            .then((response) => {

                connection.query("INSERT INTO role SET ?", response, (err, result) => {

                    if (err) throw err;

                    console.log("Insert as ID" + result.insertId);

                    trackerActions();

                })            

            });

    });   

};

function addEmployee () {

    getRoles((roles) => {   

        getEmployees((employees) => {

            employeeSelections = employees.map (employee => {                                    
                return {
                    name: employee.first_name + " " + employee.last_name,
                    value: employee.id
                };             
            });
            
            employeeSelections.unshift( {name: "None", value:null});

            inquirer
                .prompt([
                    {
                        message: "What is the employee's first name?",
                        type: "input",
                        name: "first_name",
                    },
                    { 
                        message: "What is the employee's last name?",
                        type: "input",
                        name: "last_name",
                    },
                    {
                        message: "What is the employee's role?",
                        type: "list",
                        name: "role_id",
                        choices: roles.map ( role => {                                                  
                            return {
                                name: role.title,
                                value: role.id
                            };                                 
                        })
                    },
                    {
                        message: "Who is the employee's manager?",
                        type: "list",
                        name: "manager_id",
                        choices: employeeSelections,                                                                  
                    }               
                ])
                .then((response) => {

                    connection.query("INSERT INTO employee SET ?", response, (err, result) => {

                        if (err) throw err;

                        console.log("Insert as ID" + result.insertId);

                        trackerActions();

                    })            

                });

        });   

    });
    
};

// Get Roles, Employees
function getRoles (cb) {

    connection.query("SELECT * FROM role", (err, results) => {

        if (err) throw err;

        cb(results);

    })

};

function getEmployees (cb) {

    connection.query("SELECT * FROM employee", (err, results) => {

        if (err) throw err;

        cb(results);

    })

}


// View Departments, Roles, Employees
function viewDepartments () {

    connection.query("SELECT * FROM department", (err, results) => {

        if (err) throw err;

        console.table(results);

        trackerActions();

    })

};

function viewRoles () {

    connection.query("SELECT role.id, role.title, role.salary, department.name AS department FROM role JOIN department ON role.department_id = department.id", (err, roles) => {

        console.table(roles);

        trackerActions();

    })

};

function viewEmployees () {

    connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary
                    FROM employee 
                    JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    ORDER BY department, role.title, employee.last_name`, (err, results) => {

        if (err) throw err;

        console.table(results);

        trackerActions();

    })
    
};

// Update Employee Roles
function updateEmployeeRoles () {

    getRoles((roles) => {   

        getEmployees((employees) => {

            employeeSelections = employees.map (employee => {                                    
                return {
                    name: employee.first_name + " " + employee.last_name,
                    value: employee.id
                };             
            });        
            
            inquirer
                .prompt([                
                    {
                        message: "Who do you want to update?",
                        type: "list",
                        name: "id",
                        choices: employeeSelections,                                                                  
                    },
                    {
                        message: "What is the new role for the employee?",
                        type: "list",
                        name: "role_id",
                        choices: roles.map ( role => {                                                  
                            return {
                                name: role.title,
                                value: role.id
                            };                                 
                        })                                                                  
                    }                 
                ])
                .then((response) => {

                    connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [response.role_id, response.id], (err, result) => {

                        if (err) throw err;                        

                        trackerActions();

                    })            

                });

        }); 
    
    });
    
};

trackerActions();