from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    EMPLOYEE = 1
    HR = 2
    MANAGER = 3
    ADMIN = 4
    
    ROLE_CHOICES = (
        (EMPLOYEE, "EMPLOYEE"),
        (HR, "HR"),
        (MANAGER, "MANAGER"),
        (ADMIN, "ADMIN"),
    )
    
    role = models.IntegerField(choices=ROLE_CHOICES, default=EMPLOYEE)
    phone_number = models.CharField(
        max_length=17, 
        blank=True,
        help_text="Contact phone number"
    )
    
    @property
    def is_hr(self):
        """Check if user has HR role."""
        return self.role == self.HR
    
    @property
    def is_manager(self):
        """Check if user has Manager role."""
        return self.role == self.MANAGER
    
    @property
    def is_admin_user(self):
        """Check if user has Admin role."""
        return self.role == self.ADMIN or self.is_superuser
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.username})"