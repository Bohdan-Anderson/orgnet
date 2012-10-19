from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    url(r'(.+\.html)$', 'django.views.generic.simple.direct_to_template'),
    
    # Examples:
    url(r'^$', 'orgnet.views.home'),
    # url(r'^orgbox/', include('orgbox.foo.urls')),
    url(r'^upload/', 'orgnet.views.upload_file'),
    url(r'^graphs/', 'orgnet.views.graphs'),
    url(r'^terrain/', 'orgnet.views.terrain'),
    url(r'^point/', 'orgnet.views.point'),
    url(r'^list/', 'orgnet.views.list'),
    url(r'^view/(\d+)/$', 'orgnet.views.detail'),
    url(r'^jsonGPS/', 'orgnet.views.jsonGPS', name='jsonGPS'),
    url(r'^parse/(\w\d+)/$', 'orgnet.views.parse_data'),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

)
