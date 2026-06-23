export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  titleTr: string;
  description: string;
  airDate: string;
  introStart: number;
  introEnd: number;
  videoFileName: string;
}

export interface Season {
  number: number;
  title: string;
  titleTr: string;
  element: string; // Su, Toprak, Ateş
  description: string;
  year: string;
  episodeCount: number;
  episodes: Episode[];
}

function epId(s: number, e: number): string {
  return `s${s}e${e}`;
}

function vid(_s: number, e: number): string {
  return `e${e}`;
}


export const seasons: Season[] = [
  {
    number: 1,
    title: 'Book One: Water',
    titleTr: 'Birinci Kitap: Su',
    element: 'Su',
    description: 'Yüz yıldır buz altında donmuş olan genç Avatar Aang, Katara ve Sokka tarafından bulunur. Ateş Ulusu\'nun işgaline karşı durmak için Aang\'ın dört elementi öğrenmesi gerekir — Su ile başlar.',
    year: '2005',
    episodeCount: 20,
    episodes: [
      { id: epId(1,1), season:1, episode:1, title:'The Boy in the Iceberg', titleTr:'Buzdaki Çocuk', description:'Su Kabilesi\'nden Katara ve Sokka, yüz yıldır buz altında uyuyan genç bir Hava Göçebesi olan Avatar Aang\'ı keşfeder.', airDate:'2005-02-21', introStart:0, introEnd:90, videoFileName:vid(1,1) },
      { id: epId(1,2), season:1, episode:2, title:'The Avatar Returns', titleTr:'Avatar Geri Dönüyor', description:'Ateş Ulusu prensi Zuko, Avatar\'ı yakalamak için kuzey kutbuna doğru ilerlerken, Aang köyü kurtarmak için teslim olmayı teklif eder.', airDate:'2005-02-21', introStart:0, introEnd:90, videoFileName:vid(1,2) },
      { id: epId(1,3), season:1, episode:3, title:'The Southern Air Temple', titleTr:'Güney Hava Tapınağı', description:'Aang, doğduğu yere döner; ancak orada bulduğu şey tüm Hava Göçebelerinin kaderini ortaya koyar.', airDate:'2005-03-04', introStart:0, introEnd:90, videoFileName:vid(1,3) },
      { id: epId(1,4), season:1, episode:4, title:'The Warriors of Kyoshi', titleTr:'Kyoshi Savaşçıları', description:'Grup, efsanevi Avatar Kyoshi\'nin anavatanı olan Kyoshi Adası\'na gelir ve ada\'nın genç kadın savaşçılarıyla karşılaşır.', airDate:'2005-03-18', introStart:0, introEnd:90, videoFileName:vid(1,4) },
      { id: epId(1,5), season:1, episode:5, title:'The King of Omashu', titleTr:'Omashu\'nun Kralı', description:'Aang, arkadaşlarını toprak şehri Omashu\'ya götürür; şehrin yaşlı ve sarsıcı derecede güçlü kralıyla karşılaşırlar.', airDate:'2005-03-25', introStart:0, introEnd:90, videoFileName:vid(1,5) },
      { id: epId(1,6), season:1, episode:6, title:'Imprisoned', titleTr:'Mahkum', description:'Katara, Toprak Krallığı\'nın Ateş Ulusu tarafından ele geçirilmiş bir kasabasındaki toprak bükücüleri kurtarmaya çalışır.', airDate:'2005-04-08', introStart:0, introEnd:90, videoFileName:vid(1,6) },
      { id: epId(1,7), season:1, episode:7, title:'The Spirit World (Winter Solstice, Part 1)', titleTr:'Ruh Dünyası Bölüm 1', description:'Bir orman ruhu köylüleri kaçırmaktadır; Aang, sorunu çözmek için Ruh Dünyası\'na adım atar.', airDate:'2005-04-08', introStart:0, introEnd:90, videoFileName:vid(1,7) },
      { id: epId(1,8), season:1, episode:8, title:'Avatar Roku (Winter Solstice, Part 2)', titleTr:'Avatar Roku Bölüm 2', description:'Aang, bir mesaj almak için Crescent Island\'a gitmek zorundadır; önceki Avatar Roku ile iletişim kurar.', airDate:'2005-04-15', introStart:0, introEnd:90, videoFileName:vid(1,8) },
      { id: epId(1,9), season:1, episode:9, title:'The Waterbending Scroll', titleTr:'Su Bükme Tomarı', description:'Grup, Katara\'nın su bükmeyi öğrenmesine yardımcı olacak nadir bir tomarı çalan korsanlarla karşılaşır.', airDate:'2005-04-29', introStart:0, introEnd:90, videoFileName:vid(1,9) },
      { id: epId(1,10), season:1, episode:10, title:'Jet', titleTr:'Jet', description:'Grup, Ateş Ulusu askeri işgaline karşı savaşan karizmatik bir asi olan Jet ile karşılaşır; ancak Jet\'in yöntemleri tehlikeli sınırlar aşmaktadır.', airDate:'2005-05-06', introStart:0, introEnd:90, videoFileName:vid(1,10) },
      { id: epId(1,11), season:1, episode:11, title:'The Great Divide', titleTr:'Büyük Uçurum', description:'Aang, Büyük Uçurum\'u geçmeye çalışan iki düşman kabilenin arasında arabuluculuk yapmaya çalışır.', airDate:'2005-05-20', introStart:0, introEnd:90, videoFileName:vid(1,11) },
      { id: epId(1,12), season:1, episode:12, title:'The Storm', titleTr:'Fırtına', description:'Aang neden yüz yıl önce ortadan kaybolduğunu anlatır; Zuko\'nun acı geçmişi de gün yüzüne çıkar.', airDate:'2005-06-03', introStart:0, introEnd:90, videoFileName:vid(1,12) },
      { id: epId(1,13), season:1, episode:13, title:'The Blue Spirit', titleTr:'Mavi Ruh', description:'Aang, Ateş Ulusu\'nun ağına düşer; gizemli maskeli bir figür olan Mavi Ruh onu kurtarmak için beklenmedik bir şekilde ortaya çıkar.', airDate:'2005-06-17', introStart:0, introEnd:90, videoFileName:vid(1,13) },
      { id: epId(1,14), season:1, episode:14, title:'The Fortuneteller', titleTr:'Falcı', description:'Grup, kehanetleriyle ünlü bir falcının yaşadığı köye varır; yaklaşan volkanik bir tehlike ile yüzleşmek zorunda kalırlar.', airDate:'2005-09-23', introStart:0, introEnd:90, videoFileName:vid(1,14) },
      { id: epId(1,15), season:1, episode:15, title:'Bato of the Water Tribe', titleTr:'Su Kabilesi\'nden Bato', description:'Sokka ve Katara\'nın babalarından mesaj taşıyan eski bir arkadaşla karşılaşmaları, grubun bağını sorgular.', airDate:'2005-10-07', introStart:0, introEnd:90, videoFileName:vid(1,15) },
      { id: epId(1,16), season:1, episode:16, title:'The Deserter', titleTr:'Kaçak', description:'Aang, gizlice bir Ateş Ulusu festivaline girer ve usta bir ateş bükücüsünden dersler almayı umar; ancak sonuçlar yıkıcı olur.', airDate:'2005-10-21', introStart:0, introEnd:90, videoFileName:vid(1,16) },
      { id: epId(1,17), season:1, episode:17, title:'The Northern Air Temple', titleTr:'Kuzey Hava Tapınağı', description:'Aang, Kuzey Hava Tapınağı\'nda tanıdık olmayan insanlar bulur; tapınak artık mültecilere ev sahipliği yapmaktadır.', airDate:'2005-11-04', introStart:0, introEnd:90, videoFileName:vid(1,17) },
      { id: epId(1,18), season:1, episode:18, title:'The Waterbending Master', titleTr:'Su Bükme Ustası', description:'Kuzey Su Kabilesi\'ne ulaşan grup, su bükme ustası Pakku ile tanışır; ancak Pakku\'nun kız öğrencilere öğretmeme kuralı büyük bir engel çıkarır.', airDate:'2005-11-18', introStart:0, introEnd:90, videoFileName:vid(1,18) },
      { id: epId(1,19), season:1, episode:19, title:'The Siege of the North, Part 1', titleTr:'Kuzey\'in Kuşatması, Bölüm 1', description:'Ateş Ulusu ordusu Kuzey Su Kabilesi\'ni kuşatır; Aang, kabilenin Su ruhlarını ve okyanusunu korumak için harekete geçer.', airDate:'2005-12-02', introStart:0, introEnd:90, videoFileName:vid(1,19) },
      { id: epId(1,20), season:1, episode:20, title:'The Siege of the North, Part 2', titleTr:'Kuzey\'in Kuşatması, Bölüm 2', description:'Kuzey Su Kabilesi\'ne yönelik saldırı doruk noktasına ulaşır; Aang\'ın Avatar durumu tehdit altındaki kabilenin son umudu haline gelir.', airDate:'2005-12-02', introStart:0, introEnd:90, videoFileName:vid(1,20) },
    ],
  },
  {
    number: 2,
    title: 'Book Two: Earth',
    titleTr: 'İkinci Kitap: Toprak',
    element: 'Toprak',
    description: 'Aang, toprak bükmeyi öğrenmek için kör bir toprak bükücü olan Toph\'u arar. Ekip Ba Sing Se\'ye ulaşmaya çalışırken, Azula liderliğindeki Ateş Ulusu takip etmektedir.',
    year: '2006',
    episodeCount: 18,
    episodes: [
      { id: epId(2,1), season:2, episode:1, title:'The Avatar State', titleTr:'Avatar Durumu', description:'Aang Avatar durumunu kontrol etmeyi öğrenmeye çalışır. Zuko ve Iroh, Ateş Ulusu\'ndan kaçarak kimliklerini gizler.', airDate:'2006-03-17', introStart:0, introEnd:90, videoFileName:vid(2,1) },
      { id: epId(2,2), season:2, episode:2, title:'The Cave of Two Lovers', titleTr:'İki Sevgilinin Mağarası', description:'Grup, iki efsanevi sevgiliye ithaf edilmiş tünellerden geçmek zorunda kalır. Zuko ve Iroh, yeni hayatlarına alışmaya çalışır.', airDate:'2006-03-24', introStart:0, introEnd:90, videoFileName:vid(2,2) },
      { id: epId(2,3), season:2, episode:3, title:'Return to Omashu', titleTr:'Omashu\'ya Dönüş', description:'Grup, Ateş Ulusu\'nun kontrolüne geçmiş olan Omashu\'ya döner ve eski arkadaş Kral Bumi\'yi kurtarmaya çalışır.', airDate:'2006-03-31', introStart:0, introEnd:90, videoFileName:vid(2,3) },
      { id: epId(2,4), season:2, episode:4, title:'The Swamp', titleTr:'Bataklık', description:'Gizemli bir bataklık sis içinde grubu birbirinden ayırır; her biri, geçmişlerine dair farklı görüntüler yaşar.', airDate:'2006-04-14', introStart:0, introEnd:90, videoFileName:vid(2,4) },
      { id: epId(2,5), season:2, episode:5, title:'Avatar Day', titleTr:'Avatar Günü', description:'Grup, bir önceki Avatarın suçlu bulunduğu ve Avatar\'ın yargılanacağı bir kasabaya gelir.', airDate:'2006-04-28', introStart:0, introEnd:90, videoFileName:vid(2,5) },
      { id: epId(2,6), season:2, episode:6, title:'The Blind Bandit', titleTr:'Kör Haydut', description:'Aang, yeraltında düzenlenen bir toprak bükme turnuvasında kör ve küçük bir kız olan Toph ile karşılaşır; ona toprak bükmeyi öğretmesini ister.', airDate:'2006-05-05', introStart:0, introEnd:90, videoFileName:vid(2,6) },
      { id: epId(2,7), season:2, episode:7, title:'Zuko Alone', titleTr:'Yalnız Zuko', description:'Zuko, ailesiyle geçirdiği çocukluk anlarını hatırlayarak kasvetli bir kasabada kaderine terk edilmiş bir çocuğa yardım eder.', airDate:'2006-05-12', introStart:0, introEnd:90, videoFileName:vid(2,7) },
      { id: epId(2,8), season:2, episode:8, title:'The Chase', titleTr:'Kovalamaca', description:'Azula ve elit ekibi olan Azula\'nın Melekleri grubu kovalamaya başlar; yorgunluk ve gerilim ekip içinde çatışmaya yol açar.', airDate:'2006-05-26', introStart:0, introEnd:90, videoFileName:vid(2,8) },
      { id: epId(2,9), season:2, episode:9, title:'Bitter Work', titleTr:'Zorlu Çalışma', description:'Aang, Toph\'tan toprak bükmeyi öğrenmeye çalışır; Sokka ise bir buz parçasına sıkışır.', airDate:'2006-06-02', introStart:0, introEnd:90, videoFileName:vid(2,9) },
      { id: epId(2,10), season:2, episode:10, title:'The Library', titleTr:'Kütüphane', description:'Ekip, çölün altına gizlenmiş efsanevi bir kütüphaneyi keşfeder; ancak içinde tehlikeli sırlar saklanmaktadır.', airDate:'2006-06-09', introStart:0, introEnd:90, videoFileName:vid(2,10) },
      { id: epId(2,11), season:2, episode:11, title:'The Desert', titleTr:'Çöl', description:'Appa\'yı kaybeden ekip, uçsuz bucaksız çölde hayatta kalmaya çalışır; Aang\'ın öfkesi kontrolden çıkmak üzeredir.', airDate:'2006-06-16', introStart:0, introEnd:90, videoFileName:vid(2,11) },
      { id: epId(2,12), season:2, episode:12, title:'The Serpent\'s Pass & The Drill', titleTr:'Yılan Geçidi & Matkap', description:'Ekip, tehlikeli Yılan Geçidi\'nden geçerek Ba Sing Se\'ye ulaşmaya çalışır; Zuko ve Mai ise içlerinde sakladıkları duygularla yüzleşir. Azula, Ba Sing Se\'nin surlarını delmek için devasa bir Ateş Ulusu matkapıyla saldırıya geçer; Aang ve ekip içeriden sabotaj yapmaya çalışır.', airDate:'2006-09-15', introStart:0, introEnd:90, videoFileName:'e12-13' },
      { id: epId(2,13), season:2, episode:13, title:'City of Walls and Secrets', titleTr:'Duvarlar ve Sırlar Şehri', description:'Ba Sing Se\'ye ulaşan ekip, şehrin sıkı sıkıya korunan sırlarını ve Long Feng\'in gerçek niyetini keşfeder.', airDate:'2006-09-22', introStart:0, introEnd:90, videoFileName:'e14' },
      { id: epId(2,14), season:2, episode:14, title:'The Tales of Ba Sing Se', titleTr:'Ba Sing Se\'nin Hikayeleri', description:'Ekibin her üyesi Ba Sing Se\'de kendi küçük macerasını yaşar; Iroh\'un sahnesi özellikle dokunaklıdır.', airDate:'2006-09-29', introStart:0, introEnd:90, videoFileName:'e15' },
      { id: epId(2,15), season:2, episode:15, title:'Appa\'s Lost Days', titleTr:'Appa\'nın Kayıp Günleri', description:'Appa\'nın kaçırılmasından bu yana geçirdiği günler, bizzat Appa\'nın bakış açısından anlatılır.', airDate:'2006-10-13', introStart:0, introEnd:90, videoFileName:'e16' },
      { id: epId(2,16), season:2, episode:16, title:'Lake Laogai', titleTr:'Laogai Gölü', description:'Ekip, Appa\'yı aramaya devam eder; Jet\'le karşılaşma beklenmedik bir gerçeği gün yüzüne çıkarır.', airDate:'2006-10-20', introStart:0, introEnd:90, videoFileName:'e17' },
      { id: epId(2,17), season:2, episode:17, title:'The Earth King', titleTr:'Toprak Kral', description:'Ekip, savaşın gerçekliğini Toprak Kral\'a anlatmaya çalışır ve Long Feng\'in gerçek yüzünü ortaya çıkarır.', airDate:'2006-10-27', introStart:0, introEnd:90, videoFileName:'e18' },
      { id: epId(2,18), season:2, episode:18, title:'The Guru & The Crossroads of Destiny', titleTr:'Guru & Kaderin Kavşağı', description:'Aang, Avatar durumunun kilidini açmak için Guru Pathik\'ten dersler alır. Tüm anlatılar Ba Sing Se\'nin altında birleşir; ihanete ve kahramanlığa dair yürek burkan seçimler zinciri başlar.', airDate:'2006-11-17', introStart:0, introEnd:90, videoFileName:'e19-20' },
    ],
  },
  {
    number: 3,
    title: 'Book Three: Fire',
    titleTr: 'Üçüncü Kitap: Ateş',
    element: 'Ateş',
    description: 'Son çatışma yaklaşırken Aang, Avatar olarak nihai sınavını vermek zorundadır. Zuko kendi kaderine dair büyük bir karar alır ve ekip, Ateş Lordu\'nu durdurmak için tek bir şansa sahiptir.',
    year: '2007-2008',
    episodeCount: 16,
    episodes: [
      { id: epId(3,1), season:3, episode:1, title:'The Awakening', titleTr:'Uyanış', description:'Aang, ba sing se\'deki olayların ardından ayılır ve dünyanın onu ölü sandığını fark eder; bu durumu taktiksel olarak kullanmayı planlar.', airDate:'2007-09-21', introStart:0, introEnd:90, videoFileName:vid(3,1) },
      { id: epId(3,2), season:3, episode:2, title:'The Headband', titleTr:'Kafa Bandı', description:'Ekip, Ateş Ulusu\'na sızar ve normal öğrenciler gibi yaşamaya çalışır; Aang gizlice bir okula kaydolur.', airDate:'2007-09-28', introStart:0, introEnd:90, videoFileName:vid(3,2) },
      { id: epId(3,3), season:3, episode:3, title:'The Painted Lady', titleTr:'Boyalı Kadın', description:'Katara, kirletilmiş bir nehir kasabasına yardım etmek için Boyalı Kadın efsanesini kullanır.', airDate:'2007-10-05', introStart:0, introEnd:90, videoFileName:vid(3,3) },
      { id: epId(3,4), season:3, episode:4, title:'Sokka\'s Master', titleTr:'Sokka\'nın Ustası', description:'Sokka, yeteneksiz hissetmekten bunalır ve efsanevi kılıç ustası Piandao\'dan ders almaya karar verir.', airDate:'2007-10-12', introStart:0, introEnd:90, videoFileName:vid(3,4) },
      { id: epId(3,5), season:3, episode:5, title:'The Beach', titleTr:'Sahil', description:'Azula, Zuko, Mai ve Ty Lee, kısa bir tatile çıkar; ancak her birinin derin yalnızlığı ve örselenmiş geçmişi su yüzüne çıkar.', airDate:'2007-10-19', introStart:0, introEnd:90, videoFileName:vid(3,5) },
      { id: epId(3,6), season:3, episode:6, title:'The Avatar and the Firelord', titleTr:'Avatar ve Ateş Lordu', description:'Aang ve Zuko, ataları Avatar Roku ile Ateş Lordu Sozin\'in trajik dostluğunu ayrı ayrı keşfeder.', airDate:'2007-10-26', introStart:0, introEnd:90, videoFileName:vid(3,6) },
      { id: epId(3,7), season:3, episode:7, title:'The Runaway', titleTr:'Kaçak', description:'Toph\'un para kazanmak için bükme güçlerini kullanması, Katara ile arasında ciddi bir gerilime neden olur.', airDate:'2007-11-02', introStart:0, introEnd:90, videoFileName:vid(3,7) },
      { id: epId(3,8), season:3, episode:8, title:'The Puppetmaster', titleTr:'Kuklacı', description:'Ekip, bir köyde insanların gizemli bir şekilde kaybolduğunu öğrenir; yaşlı bir kadın Katara\'ya kan bükme\'nin karanlık sırrını öğretir.', airDate:'2007-11-09', introStart:0, introEnd:90, videoFileName:vid(3,8) },
      { id: epId(3,9), season:3, episode:9, title:'Nightmares and Daydreams', titleTr:'Kabuslar ve Hayaller', description:'Aang, yaklaşan Ateş Lordu yüzleşmesi karşısında giderek artan kaygıyla baş başa kalır; uyku yoksunluğu sürreal görüntülere neden olur.', airDate:'2007-11-16', introStart:0, introEnd:90, videoFileName:vid(3,9) },
      { id: epId(3,10), season:3, episode:10, title:'The Day of Black Sun, Part 1 & 2: The Invasion & The Eclipse', titleTr:'Kara Güneş\'in Günü: İstila & Tutulma', description:'Güneş tutulması sırasında Ateş Ulusu\'nun güçsüz kalacağı gün gelir; ekip ve müttefikleri büyük istila saldırısını başlatır. Aang\'ın Ateş Lordu\'na ulaşma çabası beklenmedik bir sonuçla biter; Zuko ise kaderini belirleyecek cesur bir adım atar.', airDate:'2007-11-30', introStart:0, introEnd:90, videoFileName:'e10-11' },
      { id: epId(3,11), season:3, episode:11, title:'The Western Air Temple', titleTr:'Batı Hava Tapınağı', description:'İstila sonrası grubu bulan Zuko, onlarla birleşmek ister; ancak güven en başından inşa edilmesi gereken bir şeydir.', airDate:'2008-07-14', introStart:0, introEnd:90, videoFileName:'e12' },
      { id: epId(3,12), season:3, episode:12, title:'The Firebending Masters', titleTr:'Ateş Bükme Ustaları', description:'Aang ve Zuko, ateş bükmenin kökeni olan efsanevi ejderhalar Ran ve Shaw\'ı aramak için yola çıkar.', airDate:'2008-07-15', introStart:0, introEnd:90, videoFileName:'e13' },
      { id: epId(3,13), season:3, episode:13, title:'The Boiling Rock, Part 1 & 2', titleTr:'Kaynayan Kaya: Bölüm 1 & 2', description:'Sokka, babasını kurtarmak için Ateş Ulusu\'nun en güvenli hapishanesine, Kaynayan Kaya\'ya sızma planı yapar. Kaçış planı tehlikeye girer; Mai ve Ty Lee\'nin sadakati kritik bir anda sınanır.', airDate:'2008-07-16', introStart:0, introEnd:90, videoFileName:'e14-15' },
      { id: epId(3,14), season:3, episode:14, title:'The Southern Raiders', titleTr:'Güney Akıncıları', description:'Katara, annesini öldüren Ateş Ulusu komutanını bulmak için Zuko ile birlikte ayrı bir yolculuğa çıkar.', airDate:'2008-07-17', introStart:0, introEnd:90, videoFileName:'e16' },
      { id: epId(3,15), season:3, episode:15, title:'The Ember Island Players', titleTr:'Kor Adası Oyuncuları', description:'Ekip, kendi hikayelerini dramatize eden bir tiyatro oyunu izler; karikatürize edilen portreleri hem güldürür hem düşündürür.', airDate:'2008-07-18', introStart:0, introEnd:90, videoFileName:'e17' },
      { id: epId(3,16), season:3, episode:16, title:'Sozin\'s Comet, The Phoenix King, The Old Masters, Into the Inferno & Avatar Aang', titleTr:'Sozin\'in Kuyrukluyıldızı: Tüm Bölümler', description:'Aang planı öğrenir: Ateş Lordu Ozai, Sozin\'in Kuyrukluyıldızı\'nın getireceği güçle tüm dünyayı yakmayı planlamaktadır. Aang, yaşamı almadan savaşmayı öğrenmek için kaybolur; ekip, Beyaz Lotus Tarikatı\'nın eski ustalarıyla yeniden buluşur. Son savaşın tüm cepheleri aynı anda alevlenir. Her şey bu ana gelmekteydi ve dünyanın kaderi tek bir kavganın sonucuna bağlıdır.', airDate:'2008-07-19', introStart:0, introEnd:90, videoFileName:'e18-19-20-21' },
    ]
  },
];

export function getSeasonByNumber(seasonNumber: number): Season | undefined {
  return seasons.find((s) => s.number === seasonNumber);
}

export function getEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  return season?.episodes.find((e) => e.episode === episodeNumber);
}

export function getNextEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  if (!season) return undefined;
  const nextEp = season.episodes.find((e) => e.episode === episodeNumber + 1);
  if (nextEp) return nextEp;
  const nextSeason = getSeasonByNumber(seasonNumber + 1);
  return nextSeason?.episodes[0];
}

export function getPreviousEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  if (!season) return undefined;
  const prevEp = season.episodes.find((e) => e.episode === episodeNumber - 1);
  if (prevEp) return prevEp;
  const prevSeason = getSeasonByNumber(seasonNumber - 1);
  return prevSeason?.episodes[prevSeason.episodes.length - 1];
}



// HLS path: /videos/s1/e1/index.m3u8
const R2_BASE = (import.meta.env.VITE_R2_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

// HLS path: /s1/e1/index.m3u8
export function getVideoUrl(episode: Episode): string {
  const s = episode.season;
  const e = episode.episode;
  
  // URL'nin sonuna Date.now() ekleyerek Cloudflare Cache'ini kırmaya devam ediyoruz
  const cacheBuster = `?cb=${Date.now()}`;
  
  // R2_BASE kullanarak ve sezon/bölüm değişkenlerini dinamik vererek URL'i oluşturuyoruz
  return `${R2_BASE}/s${s}/e${e}/index.m3u8${cacheBuster}`;
}

export function getSubtitleUrl(episode: Episode, lang: 'tr' | 'en' = 'tr'): string {
  const ss = String(episode.season).padStart(2, '0');
  const ee = String(episode.episode).padStart(2, '0');
  const s = episode.season;
  const e = episode.episode;
  
  return `${R2_BASE}/s${s}/e${e}/S${ss}E${ee}${lang === 'en' ? '.en.srt' : '.srt'}`;
}

export const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodeCount, 0);