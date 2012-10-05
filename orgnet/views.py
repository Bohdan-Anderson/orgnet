from django.shortcuts import render_to_response, get_object_or_404, get_list_or_404
from django.template import RequestContext
from django.http import Http404, HttpResponse, HttpResponseRedirect
from django.views.generic import date_based, list_detail
from django.db.models import Q
from django.conf import settings
import logging, traceback, pprint
from django.core import serializers
import random
import difflib
import datetime
from django.contrib.auth import authenticate, login
import gpxpy
import gpxpy.gpx
from settings import SITE_ROOT
from django.utils import simplejson

#file upload
from django.core.context_processors import csrf
from django import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response


# GPS TEST
# 
def get_gps_data():
    print SITE_ROOT
    gpx_file = open(SITE_ROOT + '/../data/random.gpx', 'r')
    gpsDict = {}
    gpsList = []
    gpx = gpxpy.parse(gpx_file)
    counter = 0
    
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                gpsDict.update({ counter : { 'lat': point.latitude, 'lon':point.longitude }})
                counter+=1
                # gpsList.append((point.latitude, point.longitude))
                # print 'Point at ({0},{1}) -> {2}'.format(point.latitude, point.longitude, point.elevation)

    for waypoint in gpx.waypoints:
        print 'waypoint {0} -> ({1},{2})'.format(waypoint.name, waypoint.latitude, waypoint.longitude)

    for route in gpx.routes:
        print 'Route:'
        for point in route:
            print 'Point at ({0},{1}) -> {2}'.format(point.latitude, point.longitude, point.elevation)

    #print 'GPX:', gpx.to_xml()
    jsonData = simplejson.dumps(gpsDict)
    return jsonData


class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file  = forms.FileField()
    
def handle_uploaded_file(f, t):
    with open('data/%s.dat' % t, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)

def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            if request.user.is_authenticated(): 
                t = request.user.username
            else:
                t = request.POST['title']
            handle_uploaded_file(request.FILES['file'], t)
            return HttpResponseRedirect('/')
    else:
        form = UploadFileForm()
    c = {'form': form}
    c.update(csrf(request))
    return render_to_response('upload.html', c)


def home(request, tag=None):
    obj = datetime.datetime.now
    gpsdata = get_gps_data()
    return render_to_response('home.html', { 'object': obj, 'gps' : gpsdata })

def jsonGPS(request):
    gpsdata = get_gps_data()
    return HttpResponse(gpsdata, mimetype="application/json")

def terrain(request):
    obj = 'hello'
    return render_to_response('terrain.html', { 'object' : obj})

def point(request):
    obj = 'hello'
    return render_to_response('point.html', { 'object' : obj})

def custom404(request):
    return render_to_response('404.html')
