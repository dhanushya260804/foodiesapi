package com.fooddelivery.foodiesapi.filters;

import com.fooddelivery.foodiesapi.repository.DeliveryPartnerRepository;
import com.fooddelivery.foodiesapi.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserDetailsService userDetailsService;
    @Autowired private DeliveryPartnerRepository deliveryPartnerRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // First try regular user
                boolean authenticated = false;
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    if (jwtUtil.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities()
                                );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        authenticated = true;
                    }
                } catch (Exception ignored) {
                    // Not a regular user — try delivery partner
                }

                // If not a regular user, check delivery partner
                if (!authenticated) {
                    boolean isPartner = deliveryPartnerRepository.existsByEmail(email);
                    if (isPartner) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_DELIVERY_PARTNER"))
                                );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.equals("/api/register") ||
                path.equals("/api/login") ||
                path.equals("/api/orders/all") ||
                path.startsWith("/api/foods") ||
                path.startsWith("/api/reviews/food") ||
                path.equals("/api/reviews/all") ||
                path.startsWith("/api/messages") ||
                path.startsWith("/api/orders/status") ||
                path.equals("/api/delivery-partners/apply") ||
                path.equals("/api/delivery-partners/login") ||
                path.equals("/api/delivery-partners/my-status") ||
                path.equals("/api/orders/available") ||
                path.startsWith("/ws");
    }
}