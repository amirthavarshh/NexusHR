package com.nexushr.core.config;

import com.nexushr.core.model.EmployeeStatus;
import com.nexushr.core.model.LeaveStatus;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class LeaveStatusScheduler {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Scheduled(cron = "0 5 0 * * *") // daily at 00:05
    public void syncEmployeeLeaveStatus() {
        LocalDate today = LocalDate.now();

        // Start today's leaves
        leaveRequestRepository.findByStatusAndStartDate(LeaveStatus.APPROVED, today)
                .forEach(lr -> {
                    lr.getEmployee().setStatus(EmployeeStatus.ON_LEAVE);
                    employeeRepository.save(lr.getEmployee());
                });

        // End yesterday's leaves
        leaveRequestRepository.findByStatusAndEndDate(LeaveStatus.APPROVED, today.minusDays(1))
                .forEach(lr -> {
                    if (lr.getEmployee().getStatus() == EmployeeStatus.ON_LEAVE) {
                        lr.getEmployee().setStatus(EmployeeStatus.ACTIVE);
                        employeeRepository.save(lr.getEmployee());
                    }
                });
    }
}