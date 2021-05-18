from django.db import models

# Create your models here.

class NextCounter(models.Model):
    name = models.CharField(max_length=10, default='cnt', unique=True)  # CharField should be indicated with max_length
    numbering = models.IntegerField(default=1, unique=True)

    def __str__(self):
        return str(self.numbering)