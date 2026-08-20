package com.demo.backend.service;

import com.demo.backend.dto.request.QuoteRequestDTO;
import com.demo.backend.entity.QuoteRequest;
import com.demo.backend.exception.ResourceNotFoundException;
import com.demo.backend.repository.QuoteRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRequestRepository quoteRequestRepository;

    @Transactional
    public QuoteRequest submitQuote(QuoteRequestDTO dto) {
        QuoteRequest quoteRequest = QuoteRequest.builder()
                .customerName(dto.getCustomerName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .service(dto.getService())
                .message(dto.getMessage())
                .build();

        QuoteRequest saved = quoteRequestRepository.save(quoteRequest);
        log.info("New quote request received from: {} (phone: {})", dto.getCustomerName(), dto.getPhone());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<QuoteRequest> getAllQuotes() {
        return quoteRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getQuoteStats() {
        long total = quoteRequestRepository.count();
        long newCount = quoteRequestRepository.countByStatus(QuoteRequest.Status.NEW);
        long readCount = quoteRequestRepository.countByStatus(QuoteRequest.Status.READ);
        long repliedCount = quoteRequestRepository.countByStatus(QuoteRequest.Status.REPLIED);
        return Map.of(
                "total", total,
                "new", newCount,
                "read", readCount,
                "replied", repliedCount
        );
    }

    @Transactional
    public QuoteRequest markAsRead(Long id) {
        QuoteRequest quote = quoteRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));
        quote.setStatus(QuoteRequest.Status.READ);
        return quoteRequestRepository.save(quote);
    }

    @Transactional
    public QuoteRequest markAsReplied(Long id) {
        QuoteRequest quote = quoteRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuoteRequest", "id", id));
        quote.setStatus(QuoteRequest.Status.REPLIED);
        return quoteRequestRepository.save(quote);
    }
}
