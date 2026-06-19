package com.nexushr.core.repository;

import com.nexushr.core.model.Employee;
import com.nexushr.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUser(User user);
    Optional<Employee> findByUser_Username(String username);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByDepartment(String department);
}
