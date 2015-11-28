// ~ models/relay ~
define([
  'jquery',
  'underscore',
  'backbone',
  'helpers'
], function($, _, Backbone){

	var relayModel = Backbone.Model.extend({
        baseurl: 'https://onionoo.torproject.org',
        fingerprint: '',
        parseflags: function(flags, size) {
            var output = [];
            var model = this;
            _.each(flags, function(flag) {
                if (flag == "Authority") {
                    output.push([flag,"award_stroke_"+size[2]]);
                }
                if (flag == "BadExit") {
                    model.set({badexit: true});
                    output.push([flag, "denied_"+size[0]]);
                }
                if (flag == "Fast") {
                    output.push([flag,"bolt_"+size[0]]);
                }
                if (flag == "Guard") {
                    output.push([flag,"share_"+size[0]]);
                }
                if (flag == "HSDir") {
                    output.push([flag,"book_alt_"+size[0]]);
                }
                if (flag == "Named") {
                    output.push([flag,"info_"+size[2]]);
                }
                if (flag == "Running") {
                    output.push([flag,"fork_"+size[1]]);
                }
                if (flag == "Stable") {
                    output.push([flag,"cd_"+size[0]]);
                }
                if (flag == "V2Dir") {
                    output.push([flag,"book_"+size[1]]);
                }
                if (flag == "Valid") {
                    output.push([flag,"check_alt_"+size[0]]);
                }
                if (flag == "Unnamed") {
                    output.push([flag,"question_mark_"+size[2]]);
                }
                if (flag == "Exit") {
                    output.push([flag,"cloud_download_"+size[0]]);
                }
            });
            return output;
        },
        parsedate: function(utctime) {
            var hr_magic = [10];
            var t = utctime.split(" ");
            var utcd = t[0].split("-");
            var utct = t[1].split(":");
            var d = new Date(utcd[0], utcd[1]-1, utcd[2], utct[0], utct[1], utct[2]);
            var now = new Date();
            now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
            var diff = now-d;
            var secs = Math.round(diff/1000);
            var mins = Math.floor(secs/60);
            var hours = Math.floor(mins/60);
            var days = Math.floor(hours/24);
            // XXX check if this formula is correct.
            secs = secs % 60;
            mins = mins % 60;
            hours = hours % 24;
            // console.log("secs: "+secs);
            // console.log("mins: "+mins);
            // console.log("hours: "+hours);
            // console.log("days: "+days);
            var hr_date = "";
            var hr_date_full = "";
            var hr = 0;
            if (days > 0) {
                hr_date += days + "d ";
                hr += 1;
                if (days > 1) {
                    hr_date_full += days + " days ";
                } else {
                    hr_date_full += days + " day ";
                }
            }

            if (hours > 0) {
                hr_date += hours + "h ";
                hr += 1;
                if (hours > 1) {
                    hr_date_full += hours + " hours ";
                } else {
                    hr_date_full += hours + " hour ";
                }
            }


            if (mins > 0) {
                if (hr < 2) {
                    hr_date += mins + "m ";
                    hr += 1;
                }
                if (hours > 1) {
                    hr_date_full += mins + " minutes ";
                } else {
                    hr_date_full += mins + " minute ";
                }
            }

            if (hr < 2) {
                hr_date += secs + "s ";
                hr += 1;
            }
            if (hr > 1) {
                hr_date_full += "and ";
            }
            if (secs > 1) {
                hr_date_full += secs + " seconds";
            } else {
                hr_date_full += secs + " second";
            }
            var output = {hrfull: hr_date_full, hr: hr_date, millisecs: diff};
            return output

        },
        lookup: function(options) {
            var success = options.success;
            var error = options.error;
            var model = this;
            console.log("doing query..");
            $.getJSON(this.baseurl+'/details?lookup='+this.fingerprint, function(data) {
                var relay = null;
                if (data.relays.length >= 1) {
                    relay = data.relays[0];
                    relay.is_bridge = false;
                } else if (data.bridges.length >= 1) {
                    relay = data.bridges[0];
                    relay.is_bridge = true;
                }
                if (relay) {
                    //console.log(data);
                    relay.contact = relay.contact ? relay.contact : 'undefined';
                    relay.platform = relay.platform ? relay.platform : null;
                    relay.nickname = relay.nickname ? relay.nickname : "Unnamed";
                    relay.dir_address = relay.dir_address ? relay.dir_address : null;
                    relay.exit_policy = relay.exit_policy ? relay.exit_policy : null;
                    relay.exit_policy_summary = relay.exit_policy_summary ?  relay.exit_policy_summary : null;
                    relay.exit_policy_v6_summary = relay.exit_policy_v6_summary ?  relay.exit_policy_v6_summary : null;
                    relay.bandwidthr = relay.bandwidth_rate ? hrBandwidth(relay.bandwidth_rate) : null;
                    relay.bandwidthb = relay.bandwidth_burst ? hrBandwidth(relay.bandwidth_burst) : null;
                    relay.obandwidth = relay.observed_bandwidth ? hrBandwidth(relay.observed_bandwidth) : null;
                    relay.bandwidth = relay.advertised_bandwidth ? relay.advertised_bandwidth : null;
                    relay.bandwidth_hr = relay.advertised_bandwidth ? hrBandwidth(relay.advertised_bandwidth) : null;
                    if(relay.alleged_family || relay.effective_family) {
						relay.effective_family = relay.effective_family ? relay.effective_family : null;
						relay.alleged_family = relay.alleged_family ? relay.alleged_family : null;
						relay.empty_family = false;
					} else {
						relay.empty_family = true;
					}
                    if (relay.is_bridge) {
                        var new_addresses = [];
                        _.each(relay.or_addresses, function(or_addr) {
                            var addr = or_addr[0] == '[' ? "IPv6" : "IPv4";
                            addr += or_addr.slice(or_addr.lastIndexOf(":"));
                            new_addresses.push(addr);
                        });
                        relay.or_addresses = new_addresses;
                    }
                    relay.or_address = relay.or_addresses ? relay.or_addresses[0].split(":")[0] : null;
                    relay.or_port = relay.or_addresses ? relay.or_addresses[0].split(":")[1] : 0;
                    relay.dir_port = relay.dir_address ? relay.dir_address.split(":")[1] : 0;
                    relay.country = relay.country ? relay.country.toLowerCase() : null;
                    relay.countryname = relay.country ? CountryCodes[relay.country] : null;
                    relay.uptime = relay.last_restarted ? model.parsedate(relay.last_restarted) : null;
                    relay.uptime_hr = relay.last_restarted ? relay.uptime.hr : null;
                    relay.uptime_hrfull = relay.last_restarted ? relay.uptime.hrfull : null;
                    //console.log(relay.uptime.hrfull);
                    relay.uptime = relay.last_restarted ? relay.uptime.millisecs : null;
                    relay.last_restarted = relay.last_restarted ? relay.last_restarted : null;
                    relay.last_seen = relay.last_seen ? relay.last_seen : null;
                    relay.downtime = relay.last_seen ? model.parsedate(relay.last_seen).hrfull : null;
                    relay.as_no = relay.as_number ? relay.as_number : null;
                    relay.as_name = relay.as_name ? relay.as_name : null;
                    relay.transports = relay.transports ? relay.transports : null;
                    relay.fingerprint = relay.hashed_fingerprint ? relay.hashed_fingerprint : relay.fingerprint;
                    model.set({badexit: false});
                    var size = ['16x16', '14x16', '8x16'];
                    relay.flags = model.parseflags(relay.flags, size);
                    model.set(relay, options);
                    success(model, relay);
                } else {
                    error(model)
                }
            }).error(function() {console.log("error...");error();});
        }

	});

	return relayModel;
});

