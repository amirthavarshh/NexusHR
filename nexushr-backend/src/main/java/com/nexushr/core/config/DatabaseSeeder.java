package com.nexushr.core.config;

import com.nexushr.core.model.Department;
import com.nexushr.core.model.Employee;
import com.nexushr.core.repository.DepartmentRepository;
import com.nexushr.core.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@org.springframework.context.annotation.Profile("!prod")
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {

        List<String> defaultDepartments = Arrays.asList("IT", "HR", "Finance", "Sales", "Administration", "R&D");

        for (String deptName : defaultDepartments) {
            if (departmentRepository.findByDepartmentName(deptName).isEmpty()) {
                Department dept = new Department(deptName);
                dept.setDescription("Default " + deptName + " Department");
                departmentRepository.save(dept);
            }
        }

        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            if (emp.getDepartmentEntity() == null && emp.getDepartment() != null) {

                Department dept = departmentRepository.findByDepartmentName(emp.getDepartment())
                        .orElseGet(() -> {
                            Department newDept = new Department(emp.getDepartment());
                            newDept.setDescription("Auto-generated for legacy data");
                            return departmentRepository.save(newDept);
                        });

                emp.setDepartmentEntity(dept);
                employeeRepository.save(emp);
            }
        }
    }
}
