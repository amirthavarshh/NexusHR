package com.nexushr.core.service;

import com.nexushr.core.dto.AnnouncementDTO;
import com.nexushr.core.model.Announcement;
import com.nexushr.core.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    public AnnouncementDTO createAnnouncement(AnnouncementDTO dto, Long currentUserId) {
        Announcement announcement = new Announcement();
        announcement.setTitle(dto.getTitle());
        announcement.setDescription(dto.getDescription());
        announcement.setTargetAudience(dto.getTargetAudience());
        announcement.setPriority(dto.getPriority());
        announcement.setExpiryDate(dto.getExpiryDate());
        announcement.setCreatedBy(currentUserId);
        
        return convertToDTO(announcementRepository.save(announcement));
    }

    public AnnouncementDTO updateAnnouncement(Long id, AnnouncementDTO dto) {
        return announcementRepository.findById(id).map(announcement -> {
            announcement.setTitle(dto.getTitle());
            announcement.setDescription(dto.getDescription());
            announcement.setTargetAudience(dto.getTargetAudience());
            announcement.setPriority(dto.getPriority());
            announcement.setExpiryDate(dto.getExpiryDate());
            return convertToDTO(announcementRepository.save(announcement));
        }).orElseThrow(() -> new RuntimeException("Announcement not found"));
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }

    public List<AnnouncementDTO> getActiveAnnouncements() {
        LocalDateTime now = LocalDateTime.now();
        List<Announcement> activeWithExpiry = announcementRepository.findByIsActiveAndExpiryDateAfterOrderByCreatedAtDesc(true, now);
        List<Announcement> activeNoExpiry = announcementRepository.findByIsActiveAndExpiryDateIsNullOrderByCreatedAtDesc(true);
        
        activeWithExpiry.addAll(activeNoExpiry);
        // sort by created date desc
        activeWithExpiry.sort((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()));

        return activeWithExpiry.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private AnnouncementDTO convertToDTO(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setDescription(announcement.getDescription());
        dto.setTargetAudience(announcement.getTargetAudience());
        dto.setPriority(announcement.getPriority());
        dto.setCreatedBy(announcement.getCreatedBy());
        dto.setCreatedAt(announcement.getCreatedAt());
        dto.setExpiryDate(announcement.getExpiryDate());
        dto.setActive(announcement.isActive());
        return dto;
    }
}
