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

def home(request, tag=None):
    obj = datetime.datetime.now
    return render_to_response('home.html', { 'object': obj })
def test(request):
    obj = 'hello'
    print 'hi'
    return render_to_response('home.html', { 'object' : obj})

def custom404(request):
    return render_to_response('404.html')
