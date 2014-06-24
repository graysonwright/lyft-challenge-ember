import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
             updateMap: function() {
                          var routeA = this.get('routeA');
                          var origin = routeA.get('origin').get('addressString');
                          var destination = routeA.get('destination').get('addressString');
                          displayRoute(directionsDisplayA, origin, destination);

                          var routeB = this.get('routeB');
                          var origin = routeB.get('origin').get('addressString');
                          var destination = routeB.get('destination').get('addressString');
                          displayRoute(directionsDisplayB, origin, destination);

                          this.send('arbitrate');

                          this.send('center_map');
                        },

       center_map: function() {
                     var points = [this.get('routeA').get('origin'),
       this.get('routeA').get('destination'),
       this.get('routeB').get('origin'),
       this.get('routeB').get('destination')];
                     centerMap(points);
                   },

       arbitrate: function() {
                    var routeA = this.get('routeA');
                    var routeB = this.get('routeB');

                    routeA.set('winner', false);
                    routeB.set('winner', false);

                    var originA = routeA.get('origin').get('addressString');
                    var destinationA = routeA.get('destination').get('addressString');
                    var originB = routeB.get('origin').get('addressString');
                    var destinationB = routeB.get('destination').get('addressString');

                    var service = new google.maps.DistanceMatrixService();
                    service.getDistanceMatrix(
                        {
                          origins: [originA, originB, destinationA, destinationB],
                      destinations: [originA, originB, destinationA, destinationB],
                      travelMode: google.maps.TravelMode.DRIVING,
                      unitSystem: google.maps.UnitSystem.IMPERIAL,
                      durationInTraffic: false,
                      avoidHighways: false,
                      avoidTolls: false
                        }, callback);

                    function callback(response, status) {
                      if (status == google.maps.DistanceMatrixStatus.OK) {
                        var origins = response.originAddresses;
                        var destinations = response.destinationAddresses;

                        for (var i = 0; i < origins.length; i++) {
                          var results = response.rows[i].elements;
                          for (var j = 0; j < results.length; j++) {
                            var element = results[j];
                            var distance = element.distance.text;
                            var duration = element.duration.text;
                            var from = origins[i];
                            var to = destinations[j];
                            //console.log("From " + from + " to " + to + " is " + distance);
                          }
                        }

                        var aPickUpBDistance = response.rows[0].elements[1].distance.value + response.rows[1].elements[3].distance.value + response.rows[3].elements[2].distance.value;
                        console.log("a picks up b: " + aPickUpBDistance);
                        var bPickUpADistance = response.rows[1].elements[0].distance.value + response.rows[0].elements[2].distance.value + response.rows[2].elements[3].distance.value;
                        console.log("b picks up a: " + bPickUpADistance);
                        var winner, loser;
                        if(aPickUpBDistance < bPickUpADistance) {
                          winner = "A"; loser = "B";
                          routeA.set('winner', true);
                          displayRoute(directionsDisplayPickup, routeA.get('origin').get('addressString'), routeB.get('origin').get('addressString'));
                          displayRoute(directionsDisplayDropoff, routeB.get('destination').get('addressString'), routeA.get('destination').get('addressString'));
                        } else {
                          winner = "B"; loser = "A";
                          routeB.set('winner', true);
                          displayRoute(directionsDisplayPickup, routeB.get('origin').get('addressString'), routeA.get('origin').get('addressString'));
                          displayRoute(directionsDisplayDropoff, routeA.get('destination').get('addressString'), routeB.get('destination').get('addressString'));
                        }
                        console.log("It's shorter if " + winner + " picks up " + loser);
                      }
                    }
                  }
           }
});
