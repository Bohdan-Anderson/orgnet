from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User


class Route(models.Model):
    name = models.CharField(max_length=100, editable=False)
    who = models.ForeignKey(User)
    gpsData = models.CharField(max_length=40, editable=False)
    heartbeatData = models.CharField(max_length=40, editable=False)
    date_created = models.DateTimeField(auto_now_add=True)
    complete = models.BooleanField(editable=False)

    def __unicode__(self):
        return self.name

    def save(self, *args, **kwargs):
        super(Video, self).save(*args, **kwargs)
        self.name = 'route_' + str(self.pk)
        self.complete = False
