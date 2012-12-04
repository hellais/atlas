// This is the boilerplate file
// it should be used as a base for every module
define([
  'jquery',
  'underscore',
  'backbone',
  'models/relay',
  'models/graph',
  'text!templates/details/main.html',
  'tooltip',
  'popover',
  'flot',
  'canvas2img',
  'collapse',
  'helpers'
], function($, _, Backbone, relayModel, graphModel, mainDetailsTemplate){
    var mainDetailsView = Backbone.View.extend({
        el: $("#content"),
        initialize: function() {
           this.model = new relayModel;
           this.graph = new graphModel;
           //console.log(this.graph);
           $("#loading").show();
        },
        render: function() {
            var data = {relay: this.model};
            //console.log(data);
            var compiledTemplate = _.template(mainDetailsTemplate, data);
            this.el.html(compiledTemplate);
            var graph = this.graph;
            this.graph.lookup_bw(this.model.fingerprint, {
                success: function() {
                    graph.parse_bw_data(graph.data);
                    //console.log(graph.get('bw_days').write);
                    function showTooltip(x, y, contents) {
                        $('<div id="graphtooltip">' + contents + '</div>').css( {
                            position: 'absolute',
                            display: 'none',
                            top: y - 25,
                            left: x + 5,
                            border: '1px solid #fdd',
                            padding: '2px',
                            'background-color': '#fee',
                            opacity: 0.80
                        }).appendTo("body").fadeIn(200);
                    }
                    graphs = ['bw_days', 'bw_week', 'bw_month',
                            'bw_months', 'bw_year', 'bw_years'];
                    _.each(graphs, function(g) {
                        var plot_data = [{data: graph.get(g).write, label: 'write'},
                                         {data: graph.get(g).read, label: 'read'}];
                        $.plot($("#"+g),
                            plot_data, {
                                series: {
                                    lines: {show: true},
                                    points: {show: true},
                                    },
                                grid: { hoverable: true, clickable: true },
                                xaxis: {mode: 'time', tickLength: 5},
                                yaxis: {tickFormatter : function suffixFormatter(val, axis) {
                                if (val > 1000000)
                                   return (val / 1000000).toFixed(2) + "&nbsp;MB/s";
                                else if (val > 1000)
                                   return (val / 1000).toFixed(2) + "&nbsp;KB/s";
                                else
                                   return val.toFixed(2) + "&nbsp;B/s";
                                }},
                        });
                        $("#"+g).resize();


                        $("#save_"+g).attr('href', Canvas2Image.saveAsPNG($("#"+g+" > canvas.base")[0], false));

                        var previousItem = null;
                        $("#"+g).bind("plothover", function (event, pos, item){
                            if (item) {
                                if (previousItem != item.dataIndex) {
                                    previousItem = item.dataIndex;

                                    $("#graphtooltip").remove();
                                    var x = item.datapoint[0].toFixed(2),
                                        y = item.datapoint[1].toFixed(2);
                                    var bw = hrBandwidth(item.datapoint[1]);
                                    showTooltip(item.pageX, item.pageY,
                                                bw);

                                }
                            } else {
                                $("#graphtooltip").remove();
                                previousItem = null;
                            }
                        });
                    });
                }
            });

            $("#loading").hide();
            $(".flag .tooltip").hide();
            $(".tip").popover();
            $(".flag").hover(function(){
                $(this).children(".tooltip").show();

            }, function(e){

                $(this).children(".tooltip").hide();

            });

            this.graph.lookup_weights(this.model.fingerprint, {
                success: function() {
                    graph.parse_weights_data(graph.data);
                    //console.log(graph.get('weights_week').write);
                    function showTooltip(x, y, contents) {
                        $('<div id="graphtooltip">' + contents + '</div>').css( {
                            position: 'absolute',
                            display: 'none',
                            top: y - 25,
                            left: x + 5,
                            border: '1px solid #fdd',
                            padding: '2px',
                            'background-color': '#fee',
                            opacity: 0.80
                        }).appendTo("body").fadeIn(200);
                    }
                    graphs = ['weights_week', 'weights_month',
                            'weights_months', 'weights_year', 'weights_years'];
                    _.each(graphs, function(g) {
                        var plot_data = [{data: graph.get(g).advbw, label: 'advertised bandwidth fraction'},
                                         {data: graph.get(g).cw, label: 'consensus weight fraction'},
                                         {data: graph.get(g).guard, label: 'guard probability'},
                                         {data: graph.get(g).exit, label: 'exit probability'}];
                        $.plot($("#"+g),
                            plot_data, {
                                series: {
                                    lines: {show: true},
                                    points: {show: true},
                                    },
                                grid: { hoverable: true, clickable: true },
                                xaxis: {mode: 'time', tickLength: 5},
                                yaxis: {tickFormatter : function suffixFormatter(val, axis) {
                                   return (val * 100).toFixed(axis.tickDecimals) + "&nbsp;%";
                                }},
                        });
                        $("#"+g).resize();


                        $("#save_"+g).attr('href', Canvas2Image.saveAsPNG($("#"+g+" > canvas.base")[0], false));

                        var previousItem = null;
                        $("#"+g).bind("plothover", function (event, pos, item){
                            if (item) {
                                if (previousItem != item.dataIndex) {
                                    previousItem = item.dataIndex;

                                    $("#graphtooltip").remove();
                                    var x = item.datapoint[0].toFixed(2),
                                        y = item.datapoint[1].toFixed(2);
                                    var weight = (100 * item.datapoint[1]).toFixed(3) + "&nbsp;%";
                                    showTooltip(item.pageX, item.pageY,
                                                weight);

                                }
                            } else {
                                $("#graphtooltip").remove();
                                previousItem = null;
                            }
                        });
                    });
                }
            });

            $("#loading").hide();
            $(".flag .tooltip").hide();
            $(".tip").popover();
            $(".flag").hover(function(){
                $(this).children(".tooltip").show();

            }, function(e){

                $(this).children(".tooltip").hide();

            });
        },
        error: function() {
            var compiledTemplate = _.template(mainDetailsTemplate, {relay: null});
            $("#loading").hide();
            this.el.html(compiledTemplate);
        }
    });
    return new mainDetailsView;
});

