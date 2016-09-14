window.hash = [];

window.softclean = function(e, t) {
    return e.replace(/\./gim,'').replace(/"/gim, '').replace(/:/gim, '').split('ft')[0].split(' - ')[0];
}

window.clean = function(e, t) {
    return t ? e ? e.toLowerCase().replace(/"/gim, '').split(' - ')[0].split('ft')[0].replace(/^the\s|\sthe\s|\sand\s| ep$/gim, " ").replace(/part/gim, "pt").replace(RegExp("[^\\p{L}a-zA-Z0-9]", "gim"), "").replace("around", "round").trim(" ") : "" : e ? e.toLowerCase().replace(/^the\s|\sthe\s|\sand\s| ep$/gim, " ").replace(/\(.*?\)/gim, "").replace(/\[.*?\]/gim, "").replace(/part/gim, "pt").replace(RegExp("[^\\p{L}a-zA-Z0-9]", "gim"), "").replace("around", "round").trim(" ") : ""
}

var fetchFromPipe = function(tracks) {
    var hash = [];


    var vidreadiez = [];

    $.each(tracks, function(trki, trk) {
	if (!trk.name || !trk.artist) {
//	    console.log('no track name or artists');
	    return;
	}
	var cleantrk = window.clean(trk.name);
	if (cleantrk === 'length') {
	    return;
	}

	var vidready = $.Deferred();
	vidreadiez.push(vidready);

	trk.artist = trk.artist.replace(' / ', ' & ').replace(/&/gim, 'and');

	var song = cleantrk.length > 30 ? trk.name : (trk.artist.toLowerCase() + ' ' + trk.name.toLowerCase());
	if (window.accurate) {
	    song += ' ' + trk.album;
	}
	
	//	    var req = $.getJSON('https://gdata.youtube.com/feeds/api/videos?q=' + encodeURIComponent(song) + '&safeSearch=none&orderby=relevance&max-results=15&v=2&alt=json&callback=?', function(e) {
	var req = $.getJSON('https://www.googleapis.com/youtube/v3/search?part=snippet&safeSearch=none&max-results=15&key=AIzaSyDmfdow0Soqa6o_Vg-JG2Hcg11Bzrm2Vgk&type=video&q=' + encodeURIComponent(song) + '&callback=?', function(e) {


	    /*		if (!e.feed.entry || e.feed.entry.length === 0) {
	    //					   console.log('empty. resolving');
	    vidready.resolve();
	    return;
	    }*/

	    var lessgood = {};

	    $.each(e.items, function(i, entry){
		if (vidready.state() === 'resolved') {
		    return;
		}

		var cleanYTitle = window.clean(entry.snippet.title);
		var cleanartist = window.clean(trk.artist);

		var id = entry.id.videoId;
		var vidobj = {
		    order: trki,
		    id: id,
		    who_shared: 'takashirgb',
		    fromindie: true,
		    player: 'yt',
		    name: trk.name,
		    artist: trk.artist,
		    albums: trk.album,
		    viewCount: 0};

		function nogood(what, score, force) {
		    var rwhat = new RegExp(what);
		    if ((entry.snippet.title.toLowerCase().match(rwhat) ||
			 entry.snippet.description.toLowerCase().match(rwhat)) &&
			!trk.name.toLowerCase().match(rwhat)) {

			var already = lessgood[cleantrk];
			if (!already || score > already.s || force){
			    lessgood[cleantrk] = {s: score || 0, o: vidobj};   
			}

/*			console.log('its a ' + what, 'srch:',
				    song,
				    'you said: ',
				    cleanartist,
				    cleantrk,
				    'tube said',
				    cleanYTitle); */
			return true;
		    }
		    return false;
		};
		

		var superclean = window.clean(entry.snippet.title, true).replace(cleantrk, '')
		    .replace(cleanartist, '')
		    .replace('new', '')
		    .replace('album', '')
		    .replace('lyrics','')
		    .replace('hd','')
		    .replace(/\d+p/gim,'')
		    .replace(window.clean(trk.album), '');

		


		/*    if (superclean.length > 20){
		      console.log('too many guys', 'srch:',
		      song,
		      'you said: ',
		      cleanartist,
		      cleantrk,
		      'tube said',
		      cleanYTitle);
		      return;

		      }*/

		if (cleanYTitle.indexOf(cleantrk.replace(/s$/gim, '')) === -1) {
/*		    console.log('no title.', 'srch:',
				song,
				'you said: ',
				cleantrk,
				'tube said',
				cleanYTitle); */
		    return;
		}

		/*		    if (cleanYTitle.indexOf(cleanartist) === -1) {
				    var nothing = true;
				    $.each(entry.category,function(i, tag){
				    if (window.clean(tag.term).indexOf(cleanartist) !== -1){
				    nothing = false;
				    }
				    });
				    
				    if (nothing && cleantrk.length < 10) {
				    console.log('no artist.', 'srch:',
				    song,
				    'you said: ',
				    cleanartist,
				    cleantrk,
				    'tube said',
				    cleanYTitle);
				    return;
				    }
				    }*/

                //nogood('version')
		if (nogood('@ the', 2) || nogood('ballroom', 1) || nogood('at the', 1) || nogood('from the basement', 1) ||
		    nogood('acoustic', 1) || nogood('thumbs') || nogood('concert') || nogood('explains') ||
		    nogood('teaser') || nogood('session', 1) || nogood('cover') || nogood('remix') ||
		    nogood('live', 1) || nogood('perform', 2) || nogood('version', 3) ||
		    nogood('philhar') || nogood('\\d{1,2}[\\.-/]\\d{1,2}', 0, true)) {
		    return;
		}

		/*		    if (entry.media$group.media$content[0].duration < 40) {
				    return;
				    }
		*/

		vidready.resolve(vidobj);
		return;

	    });

	    var lesskeys = _.keys(lessgood);
	    if (vidready.state() !== 'resolved' && lesskeys.length) {
		vidready.resolve(lessgood[lesskeys[0]].o);
	    }

	    vidready.resolve();   

	});

	$.when(req).fail(function() {
	    vidready.resolve();
	});



	setTimeout(

	    function() {
		vidready.resolve();
	    }, 5000);
    });
    return vidreadiez;
};

$('button').click(function () {
    var w1 = window.open('about:blank');
    var songs = $.map($('textarea').val().replace(/ [–:] /gim, ' - ').split('\n'), function (s) {
        var x = {
            artist: s.split(' - ')[0],
            name: s.split(' - ')[1],
            album: s.split(' - ')[2]
        };
        return x;
    });
   

    $.when.apply($, fetchFromPipe(songs)).done(function () {
        var args = Array.prototype.slice.call(arguments, 0);
        hash = {
            playlist: [],
        }
        $.each(args, function (i, e) {
            try {
                hash.playlist.push(e.id);
            } catch (e) {}
        });

	w1.location =  'http://ayal.github.io/tubi/#' + encodeURIComponent(JSON.stringify(hash));

    });

});
