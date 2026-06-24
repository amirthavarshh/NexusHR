package com.nexushr.core.service;

import com.nexushr.core.dto.DepartmentDTO;
import com.nexushr.core.model.Department;
import com.nexushr.core.repository.DepartmentRepository;
import com.nexushr.core.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public DepartmentDTO createDepartment(DepartmentDTO dto) {
        Department dept = new Department(dto.getDepartmentName());
        dept.setDescription(dto.getDescription());
        updateManagerAndAssistant(dept, dto);
        return convertToDTO(departmentRepository.save(dept));
    }

    public DepartmentDTO updateDepartment(Long id, DepartmentDTO dto) {
        return departmentRepository.findById(id).map(dept -> {
            dept.setDepartmentName(dto.getDepartmentName());
            dept.setDescription(dto.getDescription());
            updateManagerAndAssistant(dept, dto);
            return convertToDTO(departmentRepository.save(dept));
        }).orElseThrow(() -> new RuntimeException("Department not found"));
    }

    private void updateManagerAndAssistant(Department dept, DepartmentDTO dto) {
        if (dto.getManagerId() != null) {
            employeeRepository.findById(dto.getManagerId()).ifPresent(dept::setManager);
        } else {
            dept.setManager(null);
        }
        if (dto.getAssistantId() != null) {
            employeeRepository.findById(dto.getAssistantId()).ifPresent(dept::setAssistant);
        } else {
            dept.setAssistant(null);
        }
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private DepartmentDTO convertToDTO(Department dept) {
        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(dept.getId());
        dto.setDepartmentName(dept.getDepartmentName());
        dto.setDescription(dept.getDescription());
        if (dept.getManager() != null) dto.setManagerId(dept.getManager().getId());
        if (dept.getAssistant() != null) dto.setAssistantId(dept.getAssistant().getId());
        dto.setCreatedAt(dept.getCreatedAt());
        dto.setUpdatedAt(dept.getUpdatedAt());
        return dto;
    }
}
