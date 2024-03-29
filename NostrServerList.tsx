
export const NostrServerList: Array<string> = [
  "wss://relay.nostr.info", 
  "wss://relay.damus.io",
  'wss://astral.ninja',
  //'wss://relayer.fiatjaf.com',
  //'wss://nostr.sg',
];


/*
export const NostrServerList: Array<string> = [
    'wss://astral.ninja',
    'wss://brb.io',
    'wss://btc.klendazu.com',
    'wss://deschooling.us',
    'wss://expensive-relay.fiatjaf.com',
    'wss://freedom-relay.herokuapp.com/ws',
    'wss://jiggytom.ddns.net',
    'wss://knostr.neutrine.com',
    'wss://lv01.tater.ninja',
    'wss://mule.platanito.org',
    'wss://no.contry.xyz',
    'wss://node01.nostress.cc',
    'wss://nos.lol',
    'wss://nostr-01.bolt.observer',
    'wss://nostr-1.nbo.angani.co',
    'wss://nostr1.starbackr.me',
    'wss://nostr1.tunnelsats.com',
    'wss://nostr2.actn.io',
    'wss://nostr2.namek.link',
    'wss://nostr-2.orba.ca',
    'wss://nostr-2.zebedee.cloud',
    'wss://nostr3.actn.io',
    'wss://nostr-3.orba.ca',
    'wss://relay.nostr-latam.link',
    'wss://nostr.8e23.net',
    'wss://nostr.actn.io',
    'wss://nostr-alpha.gruntwerk.org',
    'wss://nostr.aozing.com',
    'wss://nostr.bch.ninja',
    'wss://nostr-bg01.ciph.rs',
    'wss://nostr.bitcoiner.social',
    'wss://nostr.blocs.fr',
    'wss://nostr.bongbong.com',
    'wss://nostr.bostonbtc.com',
    'wss://nostr.cercatrova.me',
    'wss://nostr.chaker.net',
    'wss://nostr.coinos.io',
    'wss://nostr.coollamer.com',
    'wss://nostr.corebreach.com',
    'wss://no.str.cr',
    'wss://nostr.d11n.net',
    'wss://nostr.datamagik.com',
    'wss://nostr.delo.software',
    'wss://nostr.demovement.net',
    'wss://nostr.developer.li',
    'wss://nostr-dev.wellorder.net',
    'wss://nostr.digitalreformation.info',
    'wss://nostr.drss.io',
    'wss://nostream.gromeul.eu',
    'wss://nostr.easydns.ca',
    'wss://nostr.einundzwanzig.space',
    'wss://nostr.ethtozero.fr',
    'wss://nostrex.fly.dev',
    'wss://nostr.f44.dev',
    'wss://nostr.fly.dev',
    'wss://nostr.fmt.wiz.biz',
    'wss://nostr.formigator.eu',
    'wss://nostr.gromeul.eu',
    'wss://nostr.gruntwerk.org',
    'wss://nostr.hackerman.pro',
    'wss://nostr.handyjunky.com',
    'wss://nostr.hugo.md',
    'wss://nostr.hyperlingo.com',
    'wss://nostrical.com',
    'wss://nostrich.friendship.tw',
    'wss://nostr.itssilvestre.com',
    'wss://nostr.jiashanlu.synology.me',
    'wss://nostr.jimc.me',
    'wss://nostr.kollider.xyz',
    'wss://nostr.leximaster.com',
    'wss://nostr.lnprivate.network',
    'wss://nostr.mado.io',
    'wss://nostr.massmux.com',
    'wss://nostr.mikedilger.com',
    'wss://nostr.milou.lol',
    'wss://nostr.mom',
    'wss://nostr.mouton.dev',
    'wss://nostr.mrbits.it',
    'wss://nostr.mustardnodes.com',
    'wss://nostr.mwmdev.com',
    'wss://nostr.namek.link',
    'wss://nostr.ncsa.illinois.edu',
    'wss://nostr.nodeofsven.com',
    'wss://nostr.noones.com',
    'wss://nostr.nordlysln.net',
    'wss://nostr.nymsrelay.com',
    'wss://nostr.ono.re',
    'wss://nostr.onsats.org',
    'wss://nostr.oooxxx.ml',
    'wss://nostr.openchain.fr',
    'wss://nostr.orangepill.dev',
    'wss://nostr.orba.ca',
    'wss://no-str.org',
    'wss://nostr.oxtr.dev',
    'wss://nostr.p2sh.co',
    'wss://nostr.pobblelabs.org',
    'wss://nostr-pub1.southflorida.ninja',
    'wss://nostr-pub.semisol.dev',
    'wss://nostr-pub.wellorder.net',
    'wss://nostr.radixrat.com',
    'wss://nostr.rdfriedl.com',
    'wss://nostr-relay.alekberg.net',
    'wss://nostr-relay.australiaeast.cloudapp.azure.com',
    'wss://nostr-relay.bitcoin.ninja',
    'wss://nostrrelay.com',
    'wss://nostr-relay.derekross.me',
    'wss://nostr-relay-dev.wlvs.space',
    'wss://nostr-relay.digitalmob.ro',
    'wss://nostr.relayer.se',
    'wss://nostr-relay.freeberty.net',
    'wss://nostr-relay.freedomnode.com',
    'wss://nostr-relay.gkbrk.com',
    'wss://nostr-relay.j3s7m4n.com',
    'wss://nostr-relay.lnmarkets.com',
    'wss://nostr-relay.nonce.academy',
    'wss://nostr-relay.schnitzel.world',
    'wss://nostr-relay.smoove.net',
    'wss://nostr-relay.trustbtc.org',
    'wss://nostr-relay.untethr.me',
    // 'wss://nostr-relay.untethr.me',
    'wss://nostr-relay.usebitcoin.space',
    'wss://nostr-relay.wlvs.space',
    'wss://nostr-relay.wolfandcrow.tech',
    'wss://nostr.rewardsbunny.com',
    'wss://nostr.robotechy.com',
    'wss://nostr.rocks',
    'wss://nostr.roundrockbitcoiners.com',
    'wss://nostr.sandwich.farm',
    'wss://nostr.satsophone.tk',
    'wss://nostr.screaminglife.io',
    'wss://nostr.sectiontwo.org',
    'wss://nostr.semisol.dev',
    'wss://nostr.shadownode.org',
    'wss://nostr.shawnyeager.net',
    'wss://nostr.shmueli.org',
    'wss://nostr.simatime.com',
    'wss://nostr.slothy.win',
    'wss://nostr.sovbit.com',
    'wss://nostr.supremestack.xyz',
    'wss://nostr.swiss-enigma.ch',
    'wss://nostr.thesimplekid.com',
    'wss://nostr.tunnelsats.com',
    'wss://nostr.unknown.place',
    'wss://nostr.uselessshit.co',
    'wss://nostr.utxo.lol',
    'wss://nostr.v0l.io',
    'wss://nostr-verified.wellorder.net',
    'wss://nostr-verif.slothy.win',
    'wss://nostr.vulpem.com',
    'wss://nostr.w3ird.tech',
    'wss://nostr.walletofsatoshi.com',
    'wss://no.str.watch',
    'wss://nostr.whoop.ph',
    'wss://nostr.xpersona.net',
    'wss://nostr.yael.at',
    'wss://nostr.zaprite.io',
    'wss://nostr.zebedee.cloud',
    'wss://nostr.zenon.wtf',
    'wss://nostr.zerofeerouting.com',
    'wss://nostr.zoomout.chat',
    'wss://paid.no.str.cr',
    'wss://pow32.nostr.land',
    'wss://private-nostr.v0l.io',
    'wss://public.nostr.swissrouting.com',
    'wss://relay.21spirits.io',
    'wss://relay.bitid.nz',
    'wss://relay.boring.surf',
    'wss://relay.cryptocculture.com',
    'wss://relay.cynsar.foundation',
    'wss://relay.damus.io',
    'wss://relay.dev.kronkltd.net',
    'wss://relayer.fiatjaf.com',
    'wss://relay.farscapian.com',
    'wss://relay.futohq.com',
    'wss://relay.grunch.dev',
    'wss://relay.kronkltd.net',
    'wss://relay.lexingtonbitcoin.org',
    'wss://relay.minds.com/nostr/v1/ws',
    'wss://relay.minds.io/nostr/v1/ws',
    'wss://relay.n057r.club',
    'wss://relay.nosphr.com',
    'wss://relay.nostr.au',
    'wss://relay.nostr.band',
    'wss://relay.nostr.bg',
    'wss://relay.nostr.ch',
    'wss://relay.nostr.express',
    'wss://relay.nostrgraph.net',
    'wss://relay.nostrich.de',
    'wss://relay.nostrid.com',
    'wss://relay.nostr.info',
    'wss://relay.nostr.lu.ke',
    'wss://relay.nostrmoto.xyz',
    'wss://relay.nostr.nu',
    'wss://relay.nostropolis.xyz/websocket',
    'wss://relay.nostr.pro',
    'wss://relay.nostrprotocol.net',
    'wss://relay.nostr.ro',
    'wss://relay.nostr.scot',
    'wss://relay.nostr.vision',
    'wss://relay.nostr.xyz',
    'wss://relay.nvote.co',
    'wss://relay.nvote.co:443',
    'wss://relay.nyx.ma',
    'wss://relay.oldcity-bitcoiners.info',
    'wss://relay-pub.deschooling.us',
    'wss://relay.r3d.red',
    'wss://relay.realsearch.cc',
    'wss://relay.ryzizub.com',
    'wss://relay.sendstr.com',
    'wss://relay.snort.social',
    'wss://relay.sovereign-stack.org',
    'wss://relay.stoner.com',
    'wss://relay.taxi',
    'wss://relay.valireum.net',
    'wss://rsslay.fiatjaf.com',
    'wss://rsslay.nostr.moe',
    'wss://rsslay.nostr.net',
    'wss://satstacker.cloud',
    'wss://sg.qemura.xyz',
    'wss://student.chadpolytechnic.com',
    'wss://wizards.wormrobot.org',
    'wss://wlvs.space',
    // 'ws://jgqaglhautb4k6e6i2g34jakxiemqp6z4wynlirltuukgkft2xuglmqd.onion'
  ]

*/