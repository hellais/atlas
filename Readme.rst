Atlas
=====

Atlas is a web application to discover Tor relays. It provides useful
information on how relays are configured along with diagrams about their past.


Running it
----------

You need to have Python and Tornado installed to run the web server locally. The easiest
way of installing Tornado is:

::

  sudo easy_install tornado

Once that is done, you can run the server with the following command:

::

  python run.py

After which, the Atlas site will be available on http://localhost:8888/index.html
