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

from orgnet.models import Walk

#file upload
from django.core.context_processors import csrf
from django import forms
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
import json

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


def parse_json(dataid):
    jd = open(SITE_ROOT + '/../data/%s' % dataid)
    jdd = simplejson.load(jd)
    jd.close()
    return jdd

def create_with_heart(json_data):
    beats = 0.0
    elapsed = 0.1
    average = 73.5/60.0
    averagems = average/1000.0

    bps = 0
    bpms = 0
    curb = 60000.0 # curb average from the beginning
    thresh = 0 
    hvalues = []
    hvaluems = []
    heartDict = {}

    
    hvalues.append(average)
    hvaluems.append(averagems)
    for i in range(len(json_data)):
        KEY = str(i)
        try:    
            if json_data[KEY]['heart']: beats += 1
        except KeyError:
            pass
        # calculate elapsed in ms
        elapsedms = float(json_data[KEY]['time']-json_data['1']['time'])
        if elapsedms < 100.0: elapsedms = 100.0
        elapsed = elapsedms / 1000.0    
        bps = (bps + (beats/elapsed)) / 2
        bpms = (reduce(lambda x, y: x + y, hvaluems) / len(hvaluems) + (beats/elapsedms)) / 2
        if elapsedms < curb:
            thresh = (curb/1000)-elapsed
            threshms = curb-elapsedms
            if threshms < 1000: threshms = 1000
            if thresh < 1: thresh = 1
            bps = (bps + (average * thresh))/(thresh+1)
            bpms = (bpms + (averagems * threshms))/(threshms)

        averagems = reduce(lambda x, y: x + y, hvaluems) / len(hvaluems)
        average = averagems*1000
        bpm2 = float("%.2f" % round(bpms * 60 * 1000,3))
        bpm = float(("%.2f" % round(bps*60,3)))
        hvaluems.append(bpms)
        json_data[KEY]['heart'] =bpm
        json_data[KEY]['heart2']=bpm2
        
    return json_data

def clamp(data):
    print 'hi'
    
def find_closest(jd, k, p, clamp):
    total = str(len(jd))
    x = 1
    #print total
    for count in range(int(k)+1, len(jd)):
        if not check_anomoly(jd[str(count)][p], clamp) and count != total: return jd[str(count)][p]
    return -0.1

def check_anomoly(co, clamp):
    if abs(co) > clamp or abs(co) > clamp or co == 0.0:
        return True
    return False
    
def format_gps(jd):
    latArray = []
    lonArray = []
    anomolies = []
    for x in range(len(jd)):
        try:
            KEY = str(x)
            lat = jd[KEY]['gps']['lat']
            lon = jd[KEY]['gps']['log']
            if check_anomoly(lat, 90): anomolies.append(['lat',KEY])
            if check_anomoly(lat, 90): anomolies.append(['lon',KEY])
            jd[KEY]['lat'] = lat
            jd[KEY]['lon'] = lon
            latArray.append(lat)
            lonArray.append(lon)
            del(jd[KEY]['gps'])
        except KeyError:
            return False
    
    clampLat = reduce(lambda x, y: x + y, latArray) / len(latArray)
    clampLon = reduce(lambda x, y: x + y, latArray) / len(lonArray)
    for k in anomolies:
        akey = k[1]
        ap = k[0]
        jd[akey][ap]=float(find_closest(jd, akey, ap, 90))
    #
    return simplejson.dumps(jd)
    


def check_heart(jd):  
    for x in range(len(jd)):
        try:
            jd[str(x)]['heart']
            return True
        except KeyError:
            pass
    return False
    
def parse_data(request, dataid): # PASS DATAID VIA GET ******TODO
    
    json_data=parse_json(dataid)
    
    #CHECK FOR HEART DATA
    heart = check_heart(json_data)
    if heart: json_data = create_with_heart(json_data)
    #FORMAT GPS
    json_data = format_gps(json_data)
    
    return HttpResponse(json_data, mimetype="application/json")

class UploadFileForm(forms.Form):
    name = forms.CharField(max_length=100)
    data  = forms.FileField()
    
def handle_uploaded_file(file, name):
    walk = Walk.objects.create_walk(name=name)
    with open('data/%s' % walk.data, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    

def upload_file(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            if request.user.is_authenticated(): 
                name = request.user.username
            else:
                name = request.POST['name']
            handle_uploaded_file(request.FILES['data'], name)
            return HttpResponseRedirect('/list/')
    else:
        form = UploadFileForm()
    c = {'form': form}
    c.update(csrf(request))
    return render_to_response('upload.html', c)


def home(request, tag=None):
    obj = datetime.datetime.now
    gpsdata = get_gps_data()
    return render_to_response('home.html', { 'object': obj, 'gps' : gpsdata })
    
def list(request, tag=None):
    walks = Walk.objects.all()
    obj = {'object' : walks }
    return render_to_response('list.html', obj)
    
def detail(request, idd):
    walk = Walk.objects.get(pk=idd)
    
    return render_to_response('detail.html', {'object':walk})

def graphs(request):
    data = request.GET['walk']
    walk = get_object_or_404(Walk, data=data)
    obj = { 'obj' : walk}
    return render_to_response('graphs.html', obj)

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
