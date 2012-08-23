// This is the boilerplate file
// it should be used as a base for every module
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
    var graphModel = Backbone.Model.extend({
        baseurl: 'https://onionoo.torproject.org',
        initialize: function() {
        this.set({
            bw_days: {write: [], read: []},
            bw_week: {write: [], read: []},
            bw_month: {write: [], read: []},
            bw_months: {write: [], read: []},
            bw_year: {write: [], read: []},
            bw_years: {write: [], read: []},
            weights_week: {advbw: [], cw: [], guard: [], exit: []},
            weights_month: {advbw: [], cw: [], guard: [], exit: []},
            weights_months: {advbw: [], cw: [], guard: [], exit: []},
            weights_year: {advbw: [], cw: [], guard: [], exit: []},
            weights_years: {advbw: [], cw: [], guard: [], exit: []}
            });
        },
        lookup_bw: function(fingerprint, options) {
            var model = this;
            var success = options.success;
            // Clear the model
            this.set({
                bw_days: {write: [], read: []},
                bw_week: {write: [], read: []},
                bw_month: {write: [], read: []},
                bw_months: {write: [], read: []},
                bw_year: {write: [], read: []},
                bw_years: {write: [], read: []}
            });

            $.getJSON(this.baseurl+'/bandwidth?lookup='+fingerprint, function(data) {
                model.data = data;
                success(model, data);
            });
        },
        parse_bw_data: function(data) {
            var model = this;
            var relay = data.relays[0];
            this.fingerprint = relay.fingerprint;
            // Parse the write history of the relay
            var history = relay.write_history;
            _.each(_.keys(relay.write_history), function(period, i) {
                var first = history[period].first.split(' ');
                var date = first[0].split('-');
                var time = first[1].split(':');
                //console.log(date);
                //console.log(time);
                first = new Date(date[0], date[1]-1, date[2],
                                time[0], time[1], time[2]);
                var y = first.getTime();

                _.each(history[period].values, function(value, i) {
                    y += history[period].interval*1000;
                    var x = null
                    if (value != null) {
                        x = value*history[period].factor;
                    }

                    // This is quite a hack to conform to backbone.js
                    // funky way of setting and getting attributes in
                    // models.
                    // XXX probably want to refactor.
                    var mperiod = "bw_" + period.split("_")[1]
                    var newar = model.get(mperiod).write;
                    newar.push([y,x]);
                    var toset = {mperiod: {write: newar}};
                    model.set(toset);
                });
            });

            var history = relay.read_history;
            _.each(_.keys(relay.read_history), function(period, i) {
                var first = history[period].first.split(' ');
                var date = first[0].split('-');
                var time = first[1].split(':');
                first = new Date(date[0], date[1]-1, date[2],
                                time[0], time[1], time[2]);
                var y = first.getTime();
                _.each(history[period].values, function(value, i) {
                    y += history[period].interval*1000;
                    var x = null
                    if (value != null) {
                        x = value*history[period].factor;
                    }
                    var mperiod = "bw_" + period.split("_")[1]
                    var newar = model.get(mperiod).read;
                    newar.push([y,x]);
                    var toset = {mperiod: {read: newar}};
                    model.set(toset);
                });
            });
        },
        lookup_weights: function(fingerprint, options) {
            var model = this;
            var success = options.success;
            // Clear the model
            this.set({
                weights_week: {advbw: [], cw: [], guard: [], exit: []},
                weights_month: {advbw: [], cw: [], guard: [], exit: []},
                weights_months: {advbw: [], cw: [], guard: [], exit: []},
                weights_year: {advbw: [], cw: [], guard: [], exit: []},
                weights_years: {advbw: [], cw: [], guard: [], exit: []}
            });

            $.getJSON(this.baseurl+'/weights?lookup='+fingerprint, function(data) {
                model.data = data;
                success(model, data);
            });
        },
        parse_weights_data: function(data) {
            var model = this;
            var relay = data.relays[0];
            this.fingerprint = relay.fingerprint;

            if ("advertised_bandwidth_fraction" in relay) {
                var history = relay.advertised_bandwidth_fraction;
                _.each(_.keys(relay.advertised_bandwidth_fraction), function(period, i) {
                    var first = history[period].first.split(' ');
                    var date = first[0].split('-');
                    var time = first[1].split(':');
                    first = new Date(date[0], date[1]-1, date[2],
                                    time[0], time[1], time[2]);
                    var y = first.getTime();
                    _.each(history[period].values, function(value, i) {
                        y += history[period].interval*1000;
                        var x = null
                        if (value != null) {
                            x = value*history[period].factor;
                        }
                        var mperiod = "weights_" + period.split("_")[1]
                        var newar = model.get(mperiod).advbw;
                        newar.push([y,x]);
                        var toset = {mperiod: {advbw: newar}};
                        model.set(toset);
                    });
                });
            }

            if ("consensus_weight_fraction" in relay) {
                var history = relay.consensus_weight_fraction;
                _.each(_.keys(relay.consensus_weight_fraction), function(period, i) {
                    var first = history[period].first.split(' ');
                    var date = first[0].split('-');
                    var time = first[1].split(':');
                    first = new Date(date[0], date[1]-1, date[2],
                                    time[0], time[1], time[2]);
                    var y = first.getTime();
                    _.each(history[period].values, function(value, i) {
                        y += history[period].interval*1000;
                        var x = null
                        if (value != null) {
                            x = value*history[period].factor;
                        }
                        var mperiod = "weights_" + period.split("_")[1]
                        var newar = model.get(mperiod).cw;
                        newar.push([y,x]);
                        var toset = {mperiod: {cw: newar}};
                        model.set(toset);
                    });
                });
            }

            if ("guard_probability" in relay) {
                var history = relay.guard_probability;
                _.each(_.keys(relay.guard_probability), function(period, i) {
                    var first = history[period].first.split(' ');
                    var date = first[0].split('-');
                    var time = first[1].split(':');
                    first = new Date(date[0], date[1]-1, date[2],
                                    time[0], time[1], time[2]);
                    var y = first.getTime();
                    _.each(history[period].values, function(value, i) {
                        y += history[period].interval*1000;
                        var x = null
                        if (value != null) {
                            x = value*history[period].factor;
                        }
                        var mperiod = "weights_" + period.split("_")[1]
                        var newar = model.get(mperiod).guard;
                        newar.push([y,x]);
                        var toset = {mperiod: {guard: newar}};
                        model.set(toset);
                    });
                });
            }

            if ("exit_probability" in relay) {
                var history = relay.exit_probability;
                _.each(_.keys(relay.exit_probability), function(period, i) {
                    var first = history[period].first.split(' ');
                    var date = first[0].split('-');
                    var time = first[1].split(':');
                    first = new Date(date[0], date[1]-1, date[2],
                                    time[0], time[1], time[2]);
                    var y = first.getTime();
                    _.each(history[period].values, function(value, i) {
                        y += history[period].interval*1000;
                        var x = null
                        if (value != null) {
                            x = value*history[period].factor;
                        }
                        var mperiod = "weights_" + period.split("_")[1]
                        var newar = model.get(mperiod).exit;
                        newar.push([y,x]);
                        var toset = {mperiod: {exit: newar}};
                        model.set(toset);
                    });
                });
            }
        }
    })
    return graphModel;
});

