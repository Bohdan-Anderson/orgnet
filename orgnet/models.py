from django.db import models
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User

class WalkManager(models.Manager):
    def create_walk(self, name):
        walk = self.create(name=name)
        walk.data = 'r' + str(walk.pk)
        walk.save()
        # do something with the book
        return walk

class Walk(models.Model):
    name = models.CharField(max_length=100, editable=False)
#    who = models.ForeignKey(User)
    data = models.CharField(max_length=100, editable=False)
    date_created = models.DateTimeField(auto_now_add=True)
    objects = WalkManager()
    
    def __unicode__(self):
        return self.name

class Document(models.Model):
    title = models.CharField(max_length=50)
    file = models.FileField(upload_to='walks/%Y/%m/%d')
    
