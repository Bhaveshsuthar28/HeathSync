package com.Heath.Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HeathSyncBackend {  

	public static void main(String[] args) {
		SpringApplication.run(HeathSyncBackend.class, args);
		System.out.println("Sever Listening on " + 5000);
	}
}
