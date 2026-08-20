package com.demo.backend.repository;

import com.demo.backend.entity.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {

    List<QuoteRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(QuoteRequest.Status status);
}
