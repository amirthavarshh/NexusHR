package com.nexushr.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String cookieScheme = "cookieAuth";
        final String bearerScheme = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("NexusHR API Documentation")
                        .version("2.0")
                        .description("Production-Grade Java Full-Stack HR Platform REST endpoints, rate limits, and secure access."))
                .addSecurityItem(new SecurityRequirement().addList(cookieScheme).addList(bearerScheme))
                .components(new Components()
                        .addSecuritySchemes(cookieScheme,
                                new SecurityScheme()
                                        .name("token")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .description("JWT token stored in the 'token' HTTP-Only cookie"))
                        .addSecuritySchemes(bearerScheme,
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Standard HTTP Authorization Bearer token header")));
    }
}
