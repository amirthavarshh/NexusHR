package com.nexushr.core.repository;

import com.nexushr.core.model.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    List<Payroll> findByEmployee_Id(Long employeeId);
    List<Payroll> findByEmployee_User_Username(String username);
}
