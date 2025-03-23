package com.github.bytestrick.tabula.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Bottom of the fall.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({NoResourceFoundException.class, NullPointerException.class})
    public ErrorResponse handleNoResourceFoundException(NoResourceFoundException e, WebRequest request) {
        log.warn("{} not found, responding with 404: {}", request.getContextPath(), e.getMessage());
        return ErrorResponse
                .builder(e, ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage()))
                .build();
    }

    @ExceptionHandler({IllegalArgumentException.class})
    public ErrorResponse handleIllegalArgumentException(IllegalArgumentException e) {
        log.warn("Bad request, responding with 400: {}", e.getMessage());
        return ErrorResponse
                .builder(e, ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, e.getMessage()))
                .build();
    }

    @ExceptionHandler({Exception.class})
    public ErrorResponse handleGenericException(Exception e) {
        log.warn("Unhandled exception, responding with 500: {}", e.getMessage());
        return ErrorResponse
                .builder(e, ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage()))
                .build();
    }
}
