/**
 * Coaching tips per exercise, keyed by the video document id.
 *
 * Seeded into Firestore by scripts/seed-tips.mjs. From then on Firestore is
 * the source of truth: the trainer edits a tip in the console and every client
 * sees it without a release. This file is the starting point, not a mirror.
 *
 * Each exercise gets one of each kind — how to do it, what to watch, and an
 * easier or harder alternative. Imperative second person, which in Croatian is
 * the same for everyone.
 *
 * Written as general guidance for the trainer to review, not as her voice.
 */
export const EXERCISE_TIPS = {
  1: {
    title: "DEAD BUG (samo noge)",
    tips: [
      {
        type: "form",
        text: "Leđa priljubi uz pod i polako spuštaj jednu po jednu nogu prema podu.",
      },
      {
        type: "mistake",
        text: "Ako se donji dio leđa odvaja od poda, ne spuštaj nogu toliko nisko.",
      },
      {
        type: "alternative",
        text: "Lakše: savijenom nogom samo dotakni pod petom, bez ispružanja.",
      },
    ],
  },
  2: {
    title: "IN AND OUT",
    tips: [
      {
        type: "form",
        text: "Osloni se iza sebe na ruke, privuci koljena prema prsima pa ih kontrolirano ispruži.",
      },
      {
        type: "mistake",
        text: "Ne zabacuj se ramenima — pokret dolazi iz trbuha, ne iz zamaha.",
      },
      {
        type: "alternative",
        text: "Lakše: jednu nogu drži na podu i radi naizmjence.",
      },
    ],
  },
  3: {
    title: "CRUNCHES sa podignutim nogama",
    tips: [
      {
        type: "form",
        text: "Noge drži u zraku savijene pod 90° i uz izdah odigni lopatice od poda.",
      },
      {
        type: "mistake",
        text: "Ne vuci glavu rukama — pogled prema stropu, brada malo uvučena.",
      },
      {
        type: "alternative",
        text: "Lakše: stopala spusti na pod i radi klasične crunches.",
      },
    ],
  },
  4: {
    title: "DEAD BUG (samo ruke)",
    tips: [
      {
        type: "form",
        text: "Noge drži savijene pod 90°, leđa uz pod, i naizmjence spuštaj ruku iza glave.",
      },
      {
        type: "mistake",
        text: "Rebra ne smiju iskočiti — ako se leđa odižu, skrati pokret ruke.",
      },
      { type: "alternative", text: "Teže: u ruke uzmi laganu bučicu." },
    ],
  },
  5: {
    title: "SIDE TO SIDE PLANK",
    tips: [
      {
        type: "form",
        text: "Iz planka na podlakticama polako rotiraj kukove lijevo-desno prema podu.",
      },
      {
        type: "mistake",
        text: "Ramena drži iznad laktova i ne puštaj da kukovi propadnu.",
      },
      { type: "alternative", text: "Lakše: izvodi s koljenima na podu." },
    ],
  },
  6: {
    title: "CRUNCHES sa utegom",
    tips: [
      {
        type: "form",
        text: "Uteg drži na prsima i uz izdah odigni samo lopatice od poda.",
      },
      {
        type: "mistake",
        text: "Ne diži se do sjeda — vrh pokreta je kad se lopatice odvoje od poda.",
      },
      {
        type: "alternative",
        text: "Lakše: bez utega, ruke prekrižene na prsima.",
      },
    ],
  },
  7: {
    title: "LEG RAISES sa skokom",
    tips: [
      {
        type: "form",
        text: "Ispružene noge podigni prema stropu i na vrhu lagano odigni zdjelicu od poda.",
      },
      {
        type: "mistake",
        text: "Ne koristi zamah — zdjelicu diži trbuhom, a spuštaj je polako.",
      },
      {
        type: "alternative",
        text: "Lakše: obične leg raises, bez odizanja zdjelice.",
      },
    ],
  },
  8: {
    title: "RUSSIAN TWIST lakša varijanta",
    tips: [
      {
        type: "form",
        text: "Sjedni sa stopalima na podu, nagni se unatrag ravnih leđa i rotiraj trup lijevo-desno.",
      },
      {
        type: "mistake",
        text: "Okreći se iz trupa, ne samo rukama — prsa prate ruke.",
      },
      { type: "alternative", text: "Teže: odigni stopala od poda." },
    ],
  },
  9: {
    title: "DEAD BUG",
    tips: [
      {
        type: "form",
        text: "Istovremeno spuštaj suprotnu ruku i nogu, dok leđa ostaju priljubljena uz pod.",
      },
      {
        type: "mistake",
        text: "Kreći se sporo — brzina skriva gubitak kontrole u trbuhu.",
      },
      { type: "alternative", text: "Lakše: pomiči samo noge ili samo ruke." },
    ],
  },
  10: {
    title: "BIRD DOG",
    tips: [
      {
        type: "form",
        text: "Na sve četiri istovremeno ispruži suprotnu ruku i nogu u liniju s trupom.",
      },
      {
        type: "mistake",
        text: "Kukovi ostaju ravni — ne rotiraju se prema stropu dok dižeš nogu.",
      },
      {
        type: "alternative",
        text: "Lakše: ispružuj samo nogu, ruke ostaju na podu.",
      },
    ],
  },
  11: {
    title: "CRUNCHES",
    tips: [
      {
        type: "form",
        text: "Stopala na podu, koljena savijena; uz izdah odigni lopatice od poda.",
      },
      {
        type: "mistake",
        text: "Ruke samo pridržavaju glavu — ne vuci vrat prema naprijed.",
      },
      {
        type: "alternative",
        text: "Teže: s podignutim nogama ili s utegom na prsima.",
      },
    ],
  },
  12: {
    title: "PLANK NA DLANOVIMA",
    tips: [
      {
        type: "form",
        text: "Dlanovi ispod ramena, tijelo ravno od glave do peta, trbuh i stražnjica stegnuti.",
      },
      {
        type: "mistake",
        text: "Ne puštaj kukove prema podu i ne diži stražnjicu previsoko.",
      },
      { type: "alternative", text: "Lakše: izvodi s koljenima na podu." },
    ],
  },
  13: {
    title: "BICIKLA TRBUŠNJACI",
    tips: [
      {
        type: "form",
        text: "Lakat vodi prema suprotnom koljenu dok drugu nogu ispružuješ, polako i uz rotaciju trupa.",
      },
      {
        type: "mistake",
        text: "Ne povlači glavu rukama i ne ubrzavaj — rotacija dolazi iz trupa.",
      },
      {
        type: "alternative",
        text: "Lakše: noge drži više od poda ili radi lakšu varijantu.",
      },
    ],
  },
  14: {
    title: "THE HUNDREDS",
    tips: [
      {
        type: "form",
        text: "Lopatice odignute, noge u zraku, ispružene ruke kratko pumpaju gore-dolje uz ritmično disanje.",
      },
      {
        type: "mistake",
        text: "Ako se donji dio leđa odiže, podigni noge više ili ih savij.",
      },
      { type: "alternative", text: "Lakše: koljena savijena pod 90°." },
    ],
  },
  15: {
    title: "RUSSIAN TWIST sa utegom",
    tips: [
      {
        type: "form",
        text: "Uteg drži blizu tijela i rotiraj trup, dotičući pod pokraj kuka sa svake strane.",
      },
      {
        type: "mistake",
        text: "Leđa ostaju ravna — ne zaokružuj kralježnicu dok se okrećeš.",
      },
      {
        type: "alternative",
        text: "Lakše: bez utega ili sa stopalima na podu.",
      },
    ],
  },
  16: {
    title: "SIDE TO SIDE IN AND OUT",
    tips: [
      {
        type: "form",
        text: "Privlači koljena dijagonalno prema jednom pa drugom ramenu, kontrolirano.",
      },
      {
        type: "mistake",
        text: "Ne spuštaj noge prenisko ako se donji dio leđa odiže.",
      },
      { type: "alternative", text: "Lakše: obični in and out, bez rotacije." },
    ],
  },
  17: {
    title: "PLANK",
    tips: [
      {
        type: "form",
        text: "Laktovi ispod ramena, tijelo ravno, stražnjica i trbuh stegnuti — dišeš normalno.",
      },
      {
        type: "mistake",
        text: "Ne zadržavaj dah i ne puštaj da glava visi; pogled prema podu.",
      },
      {
        type: "alternative",
        text: "Lakše: s koljenima na podu. Teže: podigni jednu nogu.",
      },
    ],
  },
  18: {
    title: "SHOULDER TAP PLANK",
    tips: [
      {
        type: "form",
        text: "Iz planka na dlanovima naizmjence dodiruj suprotno rame, a kukovi ostaju mirni.",
      },
      {
        type: "mistake",
        text: "Ne ljuljaj kukovima — raširi stopala za više stabilnosti.",
      },
      { type: "alternative", text: "Lakše: izvodi s koljenima na podu." },
    ],
  },
  19: {
    title: "RUSSIAN TWIST",
    tips: [
      {
        type: "form",
        text: "Nagni se unatrag ravnih leđa, stopala lagano odignuta, i rotiraj trup lijevo-desno.",
      },
      {
        type: "mistake",
        text: "Ne okreći samo ramena i ruke — rotira se cijeli trup.",
      },
      { type: "alternative", text: "Lakše: stopala na podu." },
    ],
  },
  20: {
    title: "BICIKLA - lakša varijanta",
    tips: [
      {
        type: "form",
        text: "Naizmjence privlači koljeno prema prsima uz blagu rotaciju trupa.",
      },
      {
        type: "mistake",
        text: "Donji dio leđa ostaje na podu cijelo vrijeme.",
      },
      {
        type: "alternative",
        text: "Teže: klasična bicikla s ispruženom nogom.",
      },
    ],
  },
  21: {
    title: "GLUTE BRIDGE MARCHING",
    tips: [
      {
        type: "form",
        text: "Iz mosta s podignutim kukovima naizmjence podiži koljena prema prsima.",
      },
      {
        type: "mistake",
        text: "Kukovi se ne smiju spuštati ni naginjati kad podigneš nogu.",
      },
      {
        type: "alternative",
        text: "Lakše: klasični glute bridge s oba stopala na podu.",
      },
    ],
  },
  22: {
    title: "DEAD BUG sa utegom",
    tips: [
      {
        type: "form",
        text: "Uteg drži ispruženim rukama iznad prsa i naizmjence spuštaj noge prema podu.",
      },
      {
        type: "mistake",
        text: "Uteg ostaje iznad prsa — ne dopusti da povuče ruke iza glave.",
      },
      { type: "alternative", text: "Lakše: klasični dead bug bez utega." },
    ],
  },
  23: {
    title: "LEG RAISES",
    tips: [
      {
        type: "form",
        text: "Na leđima polako podiži noge do okomitog položaja, pa ih kontrolirano spusti.",
      },
      {
        type: "mistake",
        text: "Ako se leđa odižu dok spuštaš noge, ne spuštaj ih do kraja.",
      },
      { type: "alternative", text: "Lakše: sa savijenim koljenima." },
    ],
  },
  24: {
    title: "HEEL TOUCHES",
    tips: [
      {
        type: "form",
        text: "Lopatice lagano odignute; naizmjence dosegni rukom prema peti iste strane.",
      },
      {
        type: "mistake",
        text: "Ne spuštaj lopatice na pod između ponavljanja — trbuh ostaje aktivan.",
      },
      { type: "alternative", text: "Teže: stopala postavi dalje od tijela." },
    ],
  },
  25: {
    title: "MOUNTAIN CLIMBERS",
    tips: [
      {
        type: "form",
        text: "Iz planka na dlanovima brzo naizmjence privlači koljena prema prsima.",
      },
      {
        type: "mistake",
        text: "Kukovi ostaju u ravnini s ramenima — ne diži stražnjicu.",
      },
      { type: "alternative", text: "Lakše: sporo, korak po korak, bez skoka." },
    ],
  },
  26: {
    title: "SHOULDER TAP izdržaj",
    tips: [
      {
        type: "form",
        text: "U planku na dlanovima zadrži dodir ruke na suprotnom ramenu nekoliko sekundi.",
      },
      {
        type: "mistake",
        text: "Tijelo se ne rotira — ramena i kukovi ostaju paralelni s podom.",
      },
      { type: "alternative", text: "Lakše: s koljenima na podu." },
    ],
  },
  27: {
    title: "G.B. MARCHING sa utegom",
    tips: [
      {
        type: "form",
        text: "Uteg na kukovima, podigni most i naizmjence diži koljena.",
      },
      {
        type: "mistake",
        text: "Kukovi ostaju visoko i ravno, bez naginjanja na stranu.",
      },
      { type: "alternative", text: "Lakše: bez utega." },
    ],
  },
  28: {
    title: "LEG RAISES savijene noge",
    tips: [
      {
        type: "form",
        text: "Koljena savijena pod 90°; privuci ih prema prsima i lagano odigni zdjelicu.",
      },
      { type: "mistake", text: "Spuštaj polako — ne puštaj da noge padnu." },
      { type: "alternative", text: "Teže: leg raises s ravnim nogama." },
    ],
  },
  29: {
    title: "SIDE PLANK",
    tips: [
      {
        type: "form",
        text: "Lakat ispod ramena, tijelo u ravnoj liniji, kukovi podignuti.",
      },
      { type: "mistake", text: "Ne puštaj da donji kuk propadne prema podu." },
      { type: "alternative", text: "Lakše: donje koljeno spusti na pod." },
    ],
  },
  30: {
    title: "SKLOPKE - varijacija",
    tips: [
      {
        type: "form",
        text: "Istovremeno podigni trup i noge da se sretnu iznad kukova.",
      },
      {
        type: "mistake",
        text: "Ne koristi zamah — spuštaj se polako i kontrolirano.",
      },
      {
        type: "alternative",
        text: "Lakše: naizmjence diži ruku i suprotnu nogu.",
      },
    ],
  },
  31: {
    title: "SKLOPKE",
    tips: [
      {
        type: "form",
        text: "Iz ležećeg položaja istovremeno podigni ispružene ruke i noge i dosegni stopala.",
      },
      {
        type: "mistake",
        text: "Ako gubiš kontrolu nad pokretom, savij koljena.",
      },
      { type: "alternative", text: "Lakše: klasične crunches." },
    ],
  },
  32: {
    title: "LEG RAISES ravno noge",
    tips: [
      {
        type: "form",
        text: "Noge drži ispružene i zajedno, diži ih do okomitog položaja pa polako spusti.",
      },
      {
        type: "mistake",
        text: "Dlanovi ispod stražnjice pomažu da donji dio leđa ostane na podu.",
      },
      { type: "alternative", text: "Lakše: sa savijenim koljenima." },
    ],
  },
  33: {
    title: "LEG RAISES savijene noge",
    tips: [
      {
        type: "form",
        text: "Koljena savijena pod 90°; privuci ih prema prsima i lagano odigni zdjelicu.",
      },
      { type: "mistake", text: "Spuštaj polako — ne puštaj da noge padnu." },
      { type: "alternative", text: "Teže: leg raises s ravnim nogama." },
    ],
  },
  34: {
    title: "KAS GLUTE BRIDGE šipka",
    tips: [
      {
        type: "form",
        text: "Gornji dio leđa na klupi, šipka na kukovima; kratak pokret u gornjem dijelu uz snažan stisak gluteusa.",
      },
      {
        type: "mistake",
        text: "Na vrhu ne izvijaj donji dio leđa — zdjelicu lagano podvuci.",
      },
      { type: "alternative", text: "Lakše: s bučicom umjesto šipke." },
    ],
  },
  35: {
    title: "HIP THRUST šipka",
    tips: [
      {
        type: "form",
        text: "Lopatice na rubu klupe, šipka na kukovima; potisni kukove dok tijelo ne bude ravno od ramena do koljena.",
      },
      {
        type: "mistake",
        text: "Na vrhu ne izvijaj leđa — brada lagano uvučena, rebra dolje.",
      },
      { type: "alternative", text: "Lakše: s bučicom ili na mašini." },
    ],
  },
  36: {
    title: "WALL SIT izdržaj",
    tips: [
      {
        type: "form",
        text: "Leđa uz zid, koljena pod 90° iznad gležnjeva, težina na petama.",
      },
      { type: "mistake", text: "Koljena ne smiju padati prema unutra." },
      {
        type: "alternative",
        text: "Lakše: manje savijena koljena, viši položaj.",
      },
    ],
  },
  37: {
    title: "KICKBACK",
    tips: [
      {
        type: "form",
        text: "Potisni petu unatrag i prema gore, a na vrhu stisni gluteus.",
      },
      {
        type: "mistake",
        text: "Ne izvijaj donji dio leđa da bi noga išla više.",
      },
      { type: "alternative", text: "Lakše: s trakom oko natkoljenica." },
    ],
  },
  38: {
    title: "LEG EXTENSION",
    tips: [
      {
        type: "form",
        text: "Koljena u ravnini s osi sprave; ispruži noge i na vrhu kratko zadrži.",
      },
      { type: "mistake", text: "Ne spuštaj uteg naglo — vrati ga polako." },
      { type: "alternative", text: "Bez sprave: ispružanje noge s trakom." },
    ],
  },
  39: {
    title: "HIPEREKSTENZIJA",
    tips: [
      {
        type: "form",
        text: "Kukovi na rubu jastučića; spusti trup ravnih leđa i digni se stiskom gluteusa.",
      },
      {
        type: "mistake",
        text: "Na vrhu se ne izvijaj unatrag — stani kad je tijelo ravno.",
      },
      {
        type: "alternative",
        text: "Lakše: bez utega, ruke prekrižene na prsima.",
      },
    ],
  },
  40: {
    title: "STEP UP s girjom",
    tips: [
      {
        type: "form",
        text: "Cijelo stopalo na klupi; podigni se kroz petu prednje noge.",
      },
      {
        type: "mistake",
        text: "Ne odguruj se stražnjom nogom — radi prednja.",
      },
      { type: "alternative", text: "Lakše: bez girje ili na nižu stepenicu." },
    ],
  },
  41: {
    title: "STRAŽNJI ISKORACI s bučicama",
    tips: [
      {
        type: "form",
        text: "Kroči unatrag i spusti stražnje koljeno prema podu, trup lagano nagnut naprijed.",
      },
      {
        type: "mistake",
        text: "Prednje koljeno prati smjer prstiju, ne pada prema unutra.",
      },
      { type: "alternative", text: "Lakše: bez bučica, uz oslonac rukom." },
    ],
  },
  42: {
    title: "HIP THRUST sa bučicom",
    tips: [
      {
        type: "form",
        text: "Bučica na kukovima; potisni kukove i stisni gluteus na vrhu.",
      },
      {
        type: "mistake",
        text: "Stopala postavi tako da su potkoljenice okomite na vrhu pokreta.",
      },
      { type: "alternative", text: "Teže: hip thrust sa šipkom." },
    ],
  },
  43: {
    title: "KAS GLUTE BRIDGE na smithu",
    tips: [
      {
        type: "form",
        text: "Leđa na klupi, šipka smitha na kukovima; kratak pokret u gornjem dijelu uz snažan stisak gluteusa.",
      },
      {
        type: "mistake",
        text: "Zdjelicu drži lagano podvučenu, ne izvijaj leđa.",
      },
      { type: "alternative", text: "Lakše: KAS glute bridge s bučicom." },
    ],
  },
  44: {
    title: "GLUTE BRIDGE",
    tips: [
      {
        type: "form",
        text: "Na leđima, stopala blizu stražnjice; podigni kukove stiskom gluteusa.",
      },
      { type: "mistake", text: "Guraj kroz pete, ne kroz prste." },
      {
        type: "alternative",
        text: "Teže: jednonožni glute bridge ili s utegom.",
      },
    ],
  },
  45: {
    title: "HODAJUĆA ABDUKCIJA",
    tips: [
      {
        type: "form",
        text: "Traka oko nogu, lagani polučučanj i koraci u stranu.",
      },
      {
        type: "mistake",
        text: "Traka ostaje napeta cijelo vrijeme — ne sastavljaj stopala.",
      },
      {
        type: "alternative",
        text: "Lakše: slabija traka ili traka iznad koljena.",
      },
    ],
  },
  46: {
    title: "KVAD ISKORACI na smithu",
    tips: [
      {
        type: "form",
        text: "Uspravan trup; prednje koljeno smije ići preko prstiju za više rada kvadricepsa.",
      },
      { type: "mistake", text: "Peta prednje noge ostaje na podu." },
      { type: "alternative", text: "Bez smitha: iskoraci s bučicama." },
    ],
  },
  47: {
    title: "ČUČANJ na smithu",
    tips: [
      {
        type: "form",
        text: "Stopala malo ispred šipke; spusti se dok natkoljenice ne budu paralelne s podom.",
      },
      {
        type: "mistake",
        text: "Koljena ne padaju prema unutra, pete ostaju na podu.",
      },
      { type: "alternative", text: "Lakše: goblet čučanj." },
    ],
  },
  48: {
    title: "ČUČANJ S TRAKOM",
    tips: [
      {
        type: "form",
        text: "Traka iznad koljena; spusti se u čučanj i guraj koljena prema van protiv trake.",
      },
      {
        type: "mistake",
        text: "Ne dopusti da traka povuče koljena prema unutra.",
      },
      { type: "alternative", text: "Lakše: čučanj do klupe ili stolice." },
    ],
  },
  49: {
    title: "GLUTE BRIDGE S ABDUKCIJOM",
    tips: [
      {
        type: "form",
        text: "Traka iznad koljena; podigni most i na vrhu razmakni koljena protiv trake.",
      },
      { type: "mistake", text: "Kukovi ostaju gore dok radiš abdukciju." },
      { type: "alternative", text: "Lakše: bez trake." },
    ],
  },
  50: {
    title: "LEG CURLS",
    tips: [
      {
        type: "form",
        text: "Koljena u ravnini s osi sprave; savij noge i polako ih vrati.",
      },
      { type: "mistake", text: "Kukovi se ne odižu s klupe." },
      {
        type: "alternative",
        text: "Bez sprave: savijanje nogu s ručnikom na klizavom podu.",
      },
    ],
  },
  51: {
    title: "BUGARSKI ČUČANJ s bučicom",
    tips: [
      {
        type: "form",
        text: "Stražnje stopalo na klupi; spusti se okomito dok prednja natkoljenica ne bude paralelna s podom.",
      },
      {
        type: "mistake",
        text: "Težina je na prednjoj nozi — stražnja samo drži ravnotežu.",
      },
      { type: "alternative", text: "Lakše: bez bučice ili uz oslonac." },
    ],
  },
  52: {
    title: "JEDNONOŽNI LEG PRESS",
    tips: [
      {
        type: "form",
        text: "Stopalo na sredini platforme; spusti se dokle god zdjelica ostaje na sjedalu.",
      },
      { type: "mistake", text: "Na vrhu ne zaključavaj koljeno." },
      { type: "alternative", text: "Lakše: leg press s obje noge." },
    ],
  },
  53: {
    title: "JEDNONOŽNI RDL na smithu",
    tips: [
      {
        type: "form",
        text: "Koljeno stojne noge blago savijeno; gurni kukove unatrag ravnih leđa.",
      },
      {
        type: "mistake",
        text: "Kukovi ostaju paralelni s podom, ne otvaraju se u stranu.",
      },
      { type: "alternative", text: "Lakše: klasični RDL na obje noge." },
    ],
  },
  54: {
    title: "JEDNONOŽNI RDL sa šipkom",
    tips: [
      {
        type: "form",
        text: "Šipka blizu tijela; kukovi idu unatrag dok ne osjetiš istezanje stražnje lože.",
      },
      {
        type: "mistake",
        text: "Leđa ostaju ravna — ne zaokružuj ih da bi išla niže.",
      },
      { type: "alternative", text: "Lakše: s bučicama ili uz oslonac rukom." },
    ],
  },
  55: {
    title: "STEP UP sa sajlom",
    tips: [
      {
        type: "form",
        text: "Sajla nisko; podigni se na klupu kroz petu prednje noge.",
      },
      { type: "mistake", text: "Ne naginji se previše prema sajli." },
      { type: "alternative", text: "Lakše: bez sajle." },
    ],
  },
  56: {
    title: "STRAŽNJI ISKORACI smith",
    tips: [
      {
        type: "form",
        text: "Kroči unatrag ispod šipke i spusti stražnje koljeno prema podu.",
      },
      {
        type: "mistake",
        text: "Trup ostaje stabilan, prednje koljeno prati prste.",
      },
      { type: "alternative", text: "Lakše: stražnji iskoraci bez utega." },
    ],
  },
  57: {
    title: "ČUČANJ sa šipkom",
    tips: [
      {
        type: "form",
        text: "Šipka na gornjem dijelu leđa, stopala u širini ramena; spusti se ravnih leđa.",
      },
      { type: "mistake", text: "Pete ostaju na podu, koljena prate prste." },
      { type: "alternative", text: "Lakše: goblet čučanj." },
    ],
  },
  58: {
    title: "LEG PRESS",
    tips: [
      {
        type: "form",
        text: "Stopala u širini kukova na sredini platforme; spusti koljena prema prsima.",
      },
      {
        type: "mistake",
        text: "Zdjelica ostaje na sjedalu, a koljena ne zaključavaj na vrhu.",
      },
      { type: "alternative", text: "Druga opcija: čučanj na smithu." },
    ],
  },
  59: {
    title: "RDL šipka",
    tips: [
      {
        type: "form",
        text: "Šipka klizi niz natkoljenice, kukovi idu unatrag, koljena blago savijena.",
      },
      {
        type: "mistake",
        text: "Leđa ravna i šipka blizu tijela cijelim putem.",
      },
      { type: "alternative", text: "Lakše: RDL s bučicama." },
    ],
  },
  60: {
    title: "HIP THRUST na mašini",
    tips: [
      {
        type: "form",
        text: "Leđa na jastuku, stopala u širini kukova; potisni kukove i stisni gluteus na vrhu.",
      },
      { type: "mistake", text: "Na vrhu ne izvijaj leđa." },
      {
        type: "alternative",
        text: "Druga opcija: hip thrust sa šipkom ili bučicom.",
      },
    ],
  },
  61: {
    title: "STRAŽNJI ISKORACI",
    tips: [
      {
        type: "form",
        text: "Kroči unatrag i spusti stražnje koljeno, trup lagano nagnut naprijed.",
      },
      { type: "mistake", text: "Prednje koljeno ne pada prema unutra." },
      { type: "alternative", text: "Teže: s bučicama u rukama." },
    ],
  },
  62: {
    title: "STEP UP na smithu",
    tips: [
      {
        type: "form",
        text: "Šipka na leđima; podigni se na klupu kroz petu prednje noge.",
      },
      { type: "mistake", text: "Ne odguruj se stražnjom nogom." },
      { type: "alternative", text: "Lakše: step up bez utega." },
    ],
  },
  63: {
    title: "JEDNONOŽNI RDL s bučicama",
    tips: [
      {
        type: "form",
        text: "Bučice blizu noge, kukovi unatrag, slobodna noga ide natrag u liniji s trupom.",
      },
      { type: "mistake", text: "Kukovi se ne rotiraju prema van." },
      { type: "alternative", text: "Lakše: uz oslonac rukom na zid." },
    ],
  },
  64: {
    title: "BUGARSKI ČUČANJ na smithu",
    tips: [
      {
        type: "form",
        text: "Stražnje stopalo na klupi; spuštaj se okomito ispod šipke.",
      },
      {
        type: "mistake",
        text: "Prednje koljeno prati prste, ne pada prema unutra.",
      },
      { type: "alternative", text: "Lakše: bugarski čučanj bez utega." },
    ],
  },
  65: {
    title: "ADUKTORI sprava",
    tips: [
      {
        type: "form",
        text: "Kontrolirano stisni noge prema unutra i polako ih vrati.",
      },
      { type: "mistake", text: "Ne dopusti da ploče udaraju — vraćaj polako." },
      {
        type: "alternative",
        text: "Bez sprave: stiskanje lopte između koljena.",
      },
    ],
  },
  66: {
    title: "ČUČANJ S BUČICOM",
    tips: [
      {
        type: "form",
        text: "Bučica ispred prsa; spusti se s uspravnim trupom.",
      },
      { type: "mistake", text: "Pete na podu, koljena prate prste." },
      { type: "alternative", text: "Teže: čučanj sa šipkom." },
    ],
  },
  67: {
    title: "ABDUKCIJA sprava",
    tips: [
      {
        type: "form",
        text: "Razmakni noge prema van i kratko zadrži u krajnjem položaju.",
      },
      { type: "mistake", text: "Bez zamaha — vraćaj polako." },
      { type: "alternative", text: "Bez sprave: abdukcija s trakom." },
    ],
  },
  68: {
    title: "PREDNJI ISKORACI",
    tips: [
      {
        type: "form",
        text: "Korak naprijed; spusti se dok oba koljena nisu savijena pod otprilike 90°.",
      },
      { type: "mistake", text: "Prednja peta ostaje na podu, trup uspravan." },
      { type: "alternative", text: "Lakše za koljena: stražnji iskoraci." },
    ],
  },
  69: {
    title: "ABDUKCIJA S TRAKOM",
    tips: [
      {
        type: "form",
        text: "Traka iznad koljena; razmakni koljena prema van.",
      },
      {
        type: "mistake",
        text: "Trup se ne naginje — pokret dolazi iz kukova.",
      },
      {
        type: "alternative",
        text: "Teže: jača traka ili sprava za abdukciju.",
      },
    ],
  },
  70: {
    title: "BELT SQUAT",
    tips: [
      {
        type: "form",
        text: "Pojas na kukovima; spusti se s uspravnim trupom.",
      },
      { type: "mistake", text: "Koljena prate smjer prstiju." },
      { type: "alternative", text: "Druga opcija: goblet čučanj." },
    ],
  },
  71: {
    title: "KICKBACK sa ravnom nogom",
    tips: [
      {
        type: "form",
        text: "Ispružena noga ide unatrag i prema gore iz kuka.",
      },
      { type: "mistake", text: "Ne izvijaj donji dio leđa." },
      {
        type: "alternative",
        text: "Druga opcija: kickback sa savijenom nogom.",
      },
    ],
  },
  72: {
    title: "JEDNONOŽNI GLUTE BRIDGE",
    tips: [
      {
        type: "form",
        text: "Jedno stopalo na podu, druga noga u zraku; podigni kukove kroz petu.",
      },
      {
        type: "mistake",
        text: "Kukovi ostaju ravni, ne padaju na stranu slobodne noge.",
      },
      { type: "alternative", text: "Lakše: glute bridge na obje noge." },
    ],
  },
  73: {
    title: "GOBLET ČUČANJ na smithu",
    tips: [
      {
        type: "form",
        text: "Uteg uz prsa; spusti se kontrolirano s uspravnim trupom.",
      },
      { type: "mistake", text: "Pete ostaju na podu, koljena prate prste." },
      { type: "alternative", text: "Druga opcija: klasični goblet čučanj." },
    ],
  },
  74: {
    title: "KICKBACK savijena noga",
    tips: [
      {
        type: "form",
        text: "Koljeno savijeno pod 90°; potisni petu prema stropu.",
      },
      { type: "mistake", text: "Ne izvijaj donji dio leđa." },
      { type: "alternative", text: "Druga opcija: kickback s ravnom nogom." },
    ],
  },
  75: {
    title: "HIP THRUST na smithu",
    tips: [
      {
        type: "form",
        text: "Leđa na klupi, šipka smitha na kukovima; potisni kukove i stisni gluteus.",
      },
      { type: "mistake", text: "Na vrhu ne izvijaj leđa." },
      { type: "alternative", text: "Lakše: hip thrust s bučicom." },
    ],
  },
  76: {
    title: "GOBLET ČUČANJ",
    tips: [
      {
        type: "form",
        text: "Bučica ili girja uz prsa; spusti se između koljena s uspravnim trupom.",
      },
      {
        type: "mistake",
        text: "Laktovi idu unutar koljena, pete ostaju na podu.",
      },
      { type: "alternative", text: "Teže: čučanj sa šipkom." },
    ],
  },
  77: {
    title: "ZAGRIJAVANJE: DONJI DIO TIJELA",
    tips: [
      {
        type: "form",
        text: "Kreni polako i postupno povećavaj opseg pokreta.",
      },
      {
        type: "mistake",
        text: "Ne preskači zagrijavanje — pripremljeni zglobovi i mišići teže se ozljeđuju.",
      },
      {
        type: "alternative",
        text: "Kad nema vremena: barem 5 minuta brzog hoda ili bicikla.",
      },
    ],
  },
  78: {
    title: "RDL sa bučicama",
    tips: [
      {
        type: "form",
        text: "Bučice uz natkoljenice, kukovi idu unatrag, koljena blago savijena.",
      },
      {
        type: "mistake",
        text: "Spuštaj se samo dokle možeš zadržati ravna leđa.",
      },
      { type: "alternative", text: "Teže: RDL sa šipkom." },
    ],
  },
};
