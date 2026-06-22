export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  titleTr: string;
  description: string;
  airDate: string;
  introStart: number;  // saniye
  introEnd: number;    // saniye
  videoFileName: string;
}

export interface Season {
  number: number;
  title: string;
  titleTr: string;
  description: string;
  year: string;
  episodeCount: number;
  episodes: Episode[];
}

// Video dosya ismi helper — dosya isimlendirmenize göre değiştirin
function vid(s: number, e: number): string {
  const ss = String(s).padStart(2, '0');
  const ee = String(e).padStart(2, '0');
  return `S${ss}E${ee}.mp4`;
}

function epId(s: number, e: number): string {
  return `s${s}e${e}`;
}

export const seasons: Season[] = [
  {
    number: 1,
    title: 'Season 1',
    titleTr: 'Sezon 1',
    description: 'Tony Soprano, New Jersey mafya patronu olmanın getirdiği tehlikelerle ve ailesindeki gerilimlerle başa çıkmaya çalışırken, yaşadığı panik ataklar onu bir psikiyatristin koltuğuna oturtur.',
    year: '1999',
    episodeCount: 13,
    episodes: [
      { id: epId(1, 1), season: 1, episode: 1, title: 'The Sopranos', titleTr: 'Pilot', description: 'Ailesi ve işi arasındaki stresin altında ezilen Tony Soprano, geçirdiği açıklanamayan bir panik atağın ardından Dr. Melfi ile görüşmeye başlar.', airDate: '1999-01-10', introStart: 0, introEnd: 35, videoFileName: vid(1, 1) },
      { id: epId(1, 2), season: 1, episode: 2, title: '46 Long', titleTr: '46 Uzunluğunda', description: 'Christopher ve Brendan, yanlış kişilere ait kamyonları hedef alarak başlarına iş açarlar. Bu sırada Tony, annesi Livia için uygun bir huzurevi bulma telaşındadır.', airDate: '1999-01-17', introStart: 0, introEnd: 35, videoFileName: vid(1, 2) },
      { id: epId(1, 3), season: 1, episode: 3, title: 'Denial, Anger, Acceptance', titleTr: 'İnkar, Öfke, Kabul', description: 'Patron Jackie Aprile\'ın sağlık durumu kötüleşirken aile içinde güç boşluğu hissedilir. Tony, kızı Meadow\'un okuldaki aktiviteleriyle ilgilenmeye çalışır.', airDate: '1999-01-24', introStart: 0, introEnd: 35, videoFileName: vid(1, 3) },
      { id: epId(1, 4), season: 1, episode: 4, title: 'Meadowlands', titleTr: 'Meadowlands', description: 'Tony, mafya dünyasında terapiye gitmesinin zayıflık olarak algılanacağından korkar. A.J. ise babasının gerçek mesleğiyle ilgili bazı ipuçları yakalar.', airDate: '1999-01-31', introStart: 0, introEnd: 35, videoFileName: vid(1, 4) },
      { id: epId(1, 5), season: 1, episode: 5, title: 'College', titleTr: 'Üniversite', description: 'Tony, kızı Meadow ile üniversite gezisindeyken geçmişinden tanıdık bir yüzle karşılaşır. Carmela ise evde Peder Phil ile baş başa zaman geçirir.', airDate: '1999-02-07', introStart: 0, introEnd: 35, videoFileName: vid(1, 5) },
      { id: epId(1, 6), season: 1, episode: 6, title: 'Pax Soprana', titleTr: 'Pax Soprana', description: 'Liderlik koltuğu için yeni bir denge kurulurken Tony, arka planda kontrolü elinde tutmanın yollarını arar. Dr. Melfi ise kendi özel hayatında sorunlar yaşar.', airDate: '1999-02-14', introStart: 0, introEnd: 35, videoFileName: vid(1, 6) },
      { id: epId(1, 7), season: 1, episode: 7, title: 'Down Neck', titleTr: 'Mahalle', description: 'A.J.\'nin okulda disiplin cezası alması, Tony\'yi kendi çocukluğuna ve babasıyla olan karmaşık ilişkisine dair anılara götürür.', airDate: '1999-02-21', introStart: 0, introEnd: 35, videoFileName: vid(1, 7) },
      { id: epId(1, 8), season: 1, episode: 8, title: 'The Legend of Tennessee Moltisanti', titleTr: 'Tennessee Moltisanti Efsanesi', description: 'Sokaklarda FBI tutuklamaları paniği yaşanırken, Christopher mafya içindeki statüsünün yeterince tanınmadığını düşünerek bunalıma girer.', airDate: '1999-02-28', introStart: 0, introEnd: 35, videoFileName: vid(1, 8) },
      { id: epId(1, 9), season: 1, episode: 9, title: 'Boca', titleTr: 'Boca', description: 'Meadow\'un futbol koçu hakkında rahatsız edici söylentiler yayılır. Aynı zamanda Junior\'ın Boca Raton\'daki gizli tatili aile içinde alay konusu olur.', airDate: '1999-03-07', introStart: 0, introEnd: 35, videoFileName: vid(1, 9) },
      { id: epId(1, 10), season: 1, episode: 10, title: 'A Hit Is a Hit', titleTr: 'Bir Vuruş Bir Vuruştur', description: 'Tony sivil komşularıyla bağ kurmaya çalışırken farklı bir dünyayla karşılaşır. Christopher ve Adriana müzik prodüktörlüğüne soyunur.', airDate: '1999-03-14', introStart: 0, introEnd: 35, videoFileName: vid(1, 10) },
      { id: epId(1, 11), season: 1, episode: 11, title: 'Nobody Knows Anything', titleTr: 'Kimse Bir Şey Bilmiyor', description: 'Polis memuru Makazian\'dan gelen şok edici bir istihbarat, Tony\'yi kendi yakın çevresinde bir muhbir olup olmadığını sorgulamaya iter.', airDate: '1999-03-21', introStart: 0, introEnd: 35, videoFileName: vid(1, 11) },
      { id: epId(1, 12), season: 1, episode: 12, title: 'Isabella', titleTr: 'Isabella', description: 'Ağır bir depresyon geçiren Tony, komşusunun evinde kalan gizemli bir kadına takıntılı hale gelir. Arka planda ise Soprano ailesine yönelik karanlık planlar yapılmaktadır.', airDate: '1999-03-28', introStart: 0, introEnd: 35, videoFileName: vid(1, 12) },
      { id: epId(1, 13), season: 1, episode: 13, title: 'I Dream of Jeannie Cusamano', titleTr: 'Jeannie Cusamano\'yu Hayal Ediyorum', description: 'Tony, yakın çevresindeki ihanetlerin boyutunu acı bir şekilde öğrenir ve ailesinin güvenliği için radikal adımlar atmak zorunda kalır.', airDate: '1999-04-04', introStart: 0, introEnd: 35, videoFileName: vid(1, 13) },
    ],
  },
  {
    number: 2,
    title: 'Season 2',
    titleTr: 'Sezon 2',
    description: 'Tony patronluk rolüne alışırken, eski dostların dönüşü ve aile bağlarının sınanması işleri her zamankinden daha karmaşık hale getirir.',
    year: '2000',
    episodeCount: 13,
    episodes: [
      { id: epId(2, 1), season: 2, episode: 1, title: "Guy Walks into a Psychiatrist's Office...", titleTr: 'Bir Adam Psikiyatristin Ofisine Girer...', description: 'Tony kontrolü elinde tutmaya çalışırken, hapisten çıkan eski bir yüz ve beklenmedik bir ziyaretçi olan kız kardeşi Janice dengeleri değiştirir.', airDate: '2000-01-16', introStart: 0, introEnd: 35, videoFileName: vid(2, 1) },
      { id: epId(2, 2), season: 2, episode: 2, title: 'Do Not Resuscitate', titleTr: 'Canlandırmayın', description: 'Junior hapisten çıkar ancak katı şartlarla ev hapsine alınır. Livia\'nın hastanedeki durumu aile içinde yeni tartışmalara yol açar.', airDate: '2000-01-23', introStart: 0, introEnd: 35, videoFileName: vid(2, 2) },
      { id: epId(2, 3), season: 2, episode: 3, title: 'Toodle-Fucking-Oo', titleTr: 'Hoşça Kal', description: 'Richie Aprile eski gücünü geri kazanmaya çalışırken Tony ile sürtüşür. Meadow, büyükannesinin boş evinde gizlice parti düzenler.', airDate: '2000-01-30', introStart: 0, introEnd: 35, videoFileName: vid(2, 3) },
      { id: epId(2, 4), season: 2, episode: 4, title: 'Commendatori', titleTr: 'Commendatori', description: 'Tony, Paulie ve Christopher yeni iş bağlantıları kurmak için İtalya\'ya gider. Ancak Napoli\'nin kültürü ve işleyişi beklediklerinden çok farklıdır.', airDate: '2000-02-06', introStart: 0, introEnd: 35, videoFileName: vid(2, 4) },
      { id: epId(2, 5), season: 2, episode: 5, title: "Big Girls Don't Cry", titleTr: 'Büyük Kızlar Ağlamaz', description: 'Furio Giunta New Jersey\'e yerleşirken, Christopher oyunculuk dersleri almaya başlar ve Dr. Melfi, Tony ile ilgili profesyonel sınırlarını sorgular.', airDate: '2000-02-13', introStart: 0, introEnd: 35, videoFileName: vid(2, 5) },
      { id: epId(2, 6), season: 2, episode: 6, title: 'The Happy Wanderer', titleTr: 'Mutlu Gezgin', description: 'Tony, yüksek profilli klasik bir poker oyununu yeniden canlandırır. Ancak masaya eski bir lise arkadaşının katılması işleri karmaşıklaştırır.', airDate: '2000-02-20', introStart: 0, introEnd: 35, videoFileName: vid(2, 6) },
      { id: epId(2, 7), season: 2, episode: 7, title: 'D-Girl', titleTr: 'D-Girl', description: 'Christopher, Hollywood rüyasının peşinden giderek film sektöründen insanlarla tanışır. A.J. ise varoluşsal bir krizin içine sürüklenir.', airDate: '2000-02-27', introStart: 0, introEnd: 35, videoFileName: vid(2, 7) },
      { id: epId(2, 8), season: 2, episode: 8, title: 'Full Leather Jacket', titleTr: 'Deri Ceket', description: 'Richie Aprile saygı görmek için eski usul yollara başvurur. İki genç suçlu, mafya basamaklarını tırmanmak için tehlikeli bir hamle yapar.', airDate: '2000-03-05', introStart: 0, introEnd: 35, videoFileName: vid(2, 8) },
      { id: epId(2, 9), season: 2, episode: 9, title: 'From Where to Eternity', titleTr: 'Sonsuzluğa Kadar', description: 'Sarsıcı bir olayın ardından iyileşmeye çalışan Christopher, arafı andıran bir deneyim yaşar ve bu vizyon Tony ile Paulie\'yi derinden etkiler.', airDate: '2000-03-12', introStart: 0, introEnd: 35, videoFileName: vid(2, 9) },
      { id: epId(2, 10), season: 2, episode: 10, title: 'Bust Out', titleTr: 'İflas', description: 'Tony ve adamları borç batağına saplanan bir spor mağazasından kâr elde etmeye çalışırken, Carmela dul bir adamla beklenmedik bir bağ kurar.', airDate: '2000-03-19', introStart: 0, introEnd: 35, videoFileName: vid(2, 10) },
      { id: epId(2, 11), season: 2, episode: 11, title: 'House Arrest', titleTr: 'Ev Hapsi', description: 'Tony yasal görünmek için meşru bir ofis işinde zaman geçirmeye zorlanır. Junior ise ev hapsinin getirdiği can sıkıntısıyla boğuşmaktadır.', airDate: '2000-03-26', introStart: 0, introEnd: 35, videoFileName: vid(2, 11) },
      { id: epId(2, 12), season: 2, episode: 12, title: 'The Knight in White Satin Armor', titleTr: 'Beyaz Saten Zırhlı Şövalye', description: 'Janice ve Richie\'nin yaklaşan evliliği ailede gerginlik yaratırken, Tony artık bardağı taşıran isyankarlıklarla yüzleşmek zorunda kalır.', airDate: '2000-04-02', introStart: 0, introEnd: 35, videoFileName: vid(2, 12) },
      { id: epId(2, 13), season: 2, episode: 13, title: 'Funhouse', titleTr: 'Eğlence Evi', description: 'Şiddetli bir gıda zehirlenmesi Tony\'ye ateşli ve sürreal rüyalar gördürür; bu rüyalar ona yakın çevresiyle ilgili uzun zamandır inkar ettiği gerçeği gösterir.', airDate: '2000-04-09', introStart: 0, introEnd: 35, videoFileName: vid(2, 13) },
    ],
  },
  {
    number: 3,
    title: 'Season 3',
    titleTr: 'Sezon 3',
    description: 'Yeni rakiplerin ortaya çıkışı ve çocukların büyümesiyle birlikte, Tony hem iş dünyasında hem de evde kontrolü sağlamakta zorlanır.',
    year: '2001',
    episodeCount: 13,
    episodes: [
      { id: epId(3, 1), season: 3, episode: 1, title: "Mr. Ruggerio's Neighborhood", titleTr: 'Bay Ruggerio\'nun Mahallesi', description: 'FBI, Soprano malikanesini gizlice dinleyebilmek için oldukça yaratıcı ve karmaşık bir operasyon planlar.', airDate: '2001-03-04', introStart: 0, introEnd: 35, videoFileName: vid(3, 1) },
      { id: epId(3, 2), season: 3, episode: 2, title: 'Proshai, Livushka', titleTr: 'Elveda, Livushka', description: 'Soprano ailesi ani bir kayıpla sarsılır. Cenaze hazırlıkları sırasında Janice\'in dönüşü ve tuhaf istekleri ortamı gerer.', airDate: '2001-03-04', introStart: 0, introEnd: 35, videoFileName: vid(3, 2) },
      { id: epId(3, 3), season: 3, episode: 3, title: 'Fortunate Son', titleTr: 'Şanslı Oğul', description: 'Christopher hiyerarşide önemli bir adım atar. Jackie Jr., yeraltı dünyasına duyduğu ilgiyle Soprano ekibinin yörüngesine girmeye başlar.', airDate: '2001-03-11', introStart: 0, introEnd: 35, videoFileName: vid(3, 3) },
      { id: epId(3, 4), season: 3, episode: 4, title: 'Employee of the Month', titleTr: 'Ayın Çalışanı', description: 'Dr. Melfi korkunç ve sarsıcı bir travma yaşar. Adaletin yerini bulmadığını gördüğünde büyük bir ahlaki ikilemle baş başa kalır.', airDate: '2001-03-18', introStart: 0, introEnd: 35, videoFileName: vid(3, 4) },
      { id: epId(3, 5), season: 3, episode: 5, title: 'Another Toothpick', titleTr: 'Bir Kürdan Daha', description: 'Tony yolda yaşadığı bir öfke nöbeti yüzünden terapiye olan inancını sorgular. Bobby Baccalieri\'nin yaşlı ve hasta babası sahalara geri döner.', airDate: '2001-03-25', introStart: 0, introEnd: 35, videoFileName: vid(3, 5) },
      { id: epId(3, 6), season: 3, episode: 6, title: 'University', titleTr: 'Üniversite', description: 'Bada Bing\'de çalışan genç bir kadının trajik hikayesi, Ralph Cifaretto\'nun karanlık doğasını gözler önüne sererken Tony\'yi derinden sarsar.', airDate: '2001-04-01', introStart: 0, introEnd: 35, videoFileName: vid(3, 6) },
      { id: epId(3, 7), season: 3, episode: 7, title: 'Second Opinion', titleTr: 'İkinci Görüş', description: 'Carmela, suçluluk duygusuyla başa çıkmak için başka bir psikiyatristten tavsiye alır ancak duyduğu sözler beklediği teselliden çok uzaktır.', airDate: '2001-04-08', introStart: 0, introEnd: 35, videoFileName: vid(3, 7) },
      { id: epId(3, 8), season: 3, episode: 8, title: 'He Is Risen', titleTr: 'O Dirildi', description: 'Tony ve Ralph arasındaki soğuk savaş işleri etkilemeye başlar. Meadow ise Jackie Jr. ile gittikçe daha fazla yakınlaşmaktadır.', airDate: '2001-04-15', introStart: 0, introEnd: 35, videoFileName: vid(3, 8) },
      { id: epId(3, 9), season: 3, episode: 9, title: 'The Telltale Moozadell', titleTr: 'Ele Veren Moozadell', description: 'Christopher yeni bir gece kulübünün işletmesini devralır. Jackie Jr. yasadışı işlerde kendi sınırlarını aşarak büyük bir risk alır.', airDate: '2001-04-22', introStart: 0, introEnd: 35, videoFileName: vid(3, 9) },
      { id: epId(3, 10), season: 3, episode: 10, title: '...To Save Us All from Satan\'s Power', titleTr: 'Şeytanın Gücünden Bizi Kurtarmak İçin', description: 'Soprano ekibi Noel tatili için hazırlanırken, geçmişte Big Pussy ile yaşanmış olaylar Tony\'nin zihnini meşgul etmeye devam eder.', airDate: '2001-04-29', introStart: 0, introEnd: 35, videoFileName: vid(3, 10) },
      { id: epId(3, 11), season: 3, episode: 11, title: 'Pine Barrens', titleTr: 'Çam Ormanları', description: 'Paulie ve Christopher, sıradan bir tahsilat işinin çığırından çıkmasıyla kendilerini dondurucu soğukta ve ıssız ormanda hayatta kalma mücadelesi verirken bulurlar.', airDate: '2001-05-06', introStart: 0, introEnd: 35, videoFileName: vid(3, 11) },
      { id: epId(3, 12), season: 3, episode: 12, title: 'Amour Fou', titleTr: 'Çılgın Aşk', description: 'Tony\'nin Gloria ile olan ilişkisi tehlikeli ve toksik bir hal alır. Jackie Jr. ve arkadaşları, rüştlerini ispatlamak için felaketle sonuçlanacak bir hamle yapar.', airDate: '2001-05-13', introStart: 0, introEnd: 35, videoFileName: vid(3, 12) },
      { id: epId(3, 13), season: 3, episode: 13, title: 'Army of One', titleTr: 'Tek Kişilik Ordu', description: 'Jackie Jr.\'ın eylemlerinin sonuçları tüm aileyi etkiler. A.J.\'nin okuldan atılması, Tony ve Carmela\'yı onun geleceği hakkında radikal kararlar almaya iter.', airDate: '2001-05-20', introStart: 0, introEnd: 35, videoFileName: vid(3, 13) },
    ],
  },
  {
    number: 4,
    title: 'Season 4',
    titleTr: 'Sezon 4',
    description: 'Ekonomik sıkıntılar ve aile içi sırlar yavaş yavaş yüzeye çıkarken, Tony ve Carmela\'nın evliliği en büyük sınavını verir.',
    year: '2002',
    episodeCount: 13,
    episodes: [
      { id: epId(4, 1), season: 4, episode: 1, title: 'For All Debts Public and Private', titleTr: 'Tüm Borçlar İçin', description: 'Ekonomik endişeler tüm ekibi sararken, Tony sadakatini pekiştirmek için Christopher\'a babasının katiliyle ilgili çok önemli bir bilgi verir.', airDate: '2002-09-15', introStart: 0, introEnd: 35, videoFileName: vid(4, 1) },
      { id: epId(4, 2), season: 4, episode: 2, title: 'No Show', titleTr: 'Görünmez', description: 'Meadow\'un bunalımı tüm ailenin enerjisini emerken, inşaat şantiyesindeki hayalet işçiler yüzünden Christopher ve Patsy arasında gerilim yaşanır.', airDate: '2002-09-22', introStart: 0, introEnd: 35, videoFileName: vid(4, 2) },
      { id: epId(4, 3), season: 4, episode: 3, title: 'Christopher', titleTr: 'Christopher', description: 'Kolomb Günü protestoları ekibin İtalyan kökenleri nedeniyle öfkelenmesine yol açar. Bobby, hayatını sarsacak trajik bir haber alır.', airDate: '2002-09-29', introStart: 0, introEnd: 35, videoFileName: vid(4, 3) },
      { id: epId(4, 4), season: 4, episode: 4, title: 'The Weight', titleTr: 'Ağırlık', description: 'Ralph Cifaretto\'nun yaptığı düşüncesiz bir şaka, Johnny Sack\'in kulağına gidince New York ve New Jersey arasında savaş rüzgarları esmeye başlar.', airDate: '2002-10-06', introStart: 0, introEnd: 35, videoFileName: vid(4, 4) },
      { id: epId(4, 5), season: 4, episode: 5, title: 'Pie-O-My', titleTr: 'Pie-O-My', description: 'Tony, Ralph\'ın satın aldığı bir yarış atına beklenmedik bir şekilde duygusal olarak bağlanır. Carmela, geleceği güvence altına almak için mali adımlar atar.', airDate: '2002-10-13', introStart: 0, introEnd: 35, videoFileName: vid(4, 5) },
      { id: epId(4, 6), season: 4, episode: 6, title: 'Everybody Hurts', titleTr: 'Herkes Acı Çeker', description: 'Geçmişten gelen trajik bir haber Tony\'yi empati yapmaya zorlar. Artie Bucco, tehlikeli bir yatırım fikriyle Tony\'den borç ister.', airDate: '2002-10-20', introStart: 0, introEnd: 35, videoFileName: vid(4, 6) },
      { id: epId(4, 7), season: 4, episode: 7, title: 'Watching Too Much Television', titleTr: 'Çok Fazla Televizyon', description: 'Adriana kendisine oynanan oyunun ağırlığı altında ezilmeye başlar. Paulie hapisten çıkar ve Johnny Sack ile olan ilişkisini tartmaya çalışır.', airDate: '2002-10-27', introStart: 0, introEnd: 35, videoFileName: vid(4, 7) },
      { id: epId(4, 8), season: 4, episode: 8, title: 'Mergers and Acquisitions', titleTr: 'Birleşme ve Satın Alma', description: 'Carmela, Tony\'nin gizli paralarını keşfeder. Tony ise yeni tanıştığı bir kadınla iş ve özel hayatın sınırlarını bulanıklaştırır.', airDate: '2002-11-03', introStart: 0, introEnd: 35, videoFileName: vid(4, 8) },
      { id: epId(4, 9), season: 4, episode: 9, title: 'Whoever Did This', titleTr: 'Bunu Kim Yaptıysa', description: 'Ahırda çıkan şüpheli ve trajik bir yangın, Tony ve Ralph arasındaki gerginliği patlama noktasına getirir ve hiçbir şeyin eskisi gibi olmamasına neden olur.', airDate: '2002-11-10', introStart: 0, introEnd: 35, videoFileName: vid(4, 9) },
      { id: epId(4, 10), season: 4, episode: 10, title: 'The Strong, Silent Type', titleTr: 'Güçlü, Sessiz Tip', description: 'Christopher\'ın bağımlılığının kontrolden çıkması üzerine, aile ve ekip onu tedavi olmaya ikna etmek için yüzleşme toplantısı düzenler.', airDate: '2002-11-17', introStart: 0, introEnd: 35, videoFileName: vid(4, 10) },
      { id: epId(4, 11), season: 4, episode: 11, title: 'Calling All Cars', titleTr: 'Tüm Araçları Çağırın', description: 'Tony terapinin işe yaramadığını düşünmeye başlar. Junior\'ın davası devam ederken, Tony rüyalarında kimliğini ve geleceğini sorgular.', airDate: '2002-11-24', introStart: 0, introEnd: 35, videoFileName: vid(4, 11) },
      { id: epId(4, 12), season: 4, episode: 12, title: 'Eloise', titleTr: 'Eloise', description: 'Carmela ve Furio arasındaki gerilim, Furio\'yu tehlikeli düşüncelere ve beklenmedik bir eyleme iter. Meadow\'un bağımsızlığı annesiyle çatışmasına neden olur.', airDate: '2002-12-01', introStart: 0, introEnd: 35, videoFileName: vid(4, 12) },
      { id: epId(4, 13), season: 4, episode: 13, title: 'Whitecaps', titleTr: 'Beyaz Köpükler', description: 'Bir sahil evi yatırımı sırasında ortaya çıkan sırlar ve ihanetler, Tony ile Carmela\'nın evliliğini nihai kırılma noktasına taşır.', airDate: '2002-12-08', introStart: 0, introEnd: 35, videoFileName: vid(4, 13) },
    ],
  },
  {
    number: 5,
    title: 'Season 5',
    titleTr: 'Sezon 5',
    description: 'Eski mahkumların hapisten çıkıp sokaklara dönmesiyle birlikte New York ve New Jersey arasında güç dengeleri sarsılır.',
    year: '2004',
    episodeCount: 13,
    episodes: [
      { id: epId(5, 1), season: 5, episode: 1, title: 'Two Tonys', titleTr: 'İki Tony', description: 'Tony B dâhil olmak üzere eski kuşak mahkumların sokağa dönmesi işleri karıştırır. Evlilikleri dağılan Tony ve Carmela yeni hayatlarına alışmaya çalışır.', airDate: '2004-03-07', introStart: 0, introEnd: 35, videoFileName: vid(5, 1) },
      { id: epId(5, 2), season: 5, episode: 2, title: 'Rat Pack', titleTr: 'Sıçan Sürüsü', description: 'Eski dostlar için düzenlenen kutlamalar gölgelenirken, Adriana üzerindeki FBI baskısı artık saklanamayacak boyutlara ulaşır.', airDate: '2004-03-14', introStart: 0, introEnd: 35, videoFileName: vid(5, 2) },
      { id: epId(5, 3), season: 5, episode: 3, title: "Where's Johnny?", titleTr: 'Johnny Nerede?', description: 'Junior\'ın giderek bozulan zihinsel durumu onu tehlikeli bir şekilde geçmişe götürür. New York\'ta ise taht kavgaları başlar.', airDate: '2004-03-21', introStart: 0, introEnd: 35, videoFileName: vid(5, 3) },
      { id: epId(5, 4), season: 5, episode: 4, title: 'All Happy Families...', titleTr: 'Tüm Mutlu Aileler...', description: 'Tony B sivil bir hayata uyum sağlamaya çalışırken zorluklarla karşılaşır. Eski kurt Feech La Manna, Soprano ekibiyle sınırları test eder.', airDate: '2004-03-28', introStart: 0, introEnd: 35, videoFileName: vid(5, 4) },
      { id: epId(5, 5), season: 5, episode: 5, title: 'Irregular Around the Margins', titleTr: 'Kenarlarında Düzensiz', description: 'Tony ve Adriana\'nın gece yarısı geçirdiği trafik kazası, dedikodu çarklarını hızla döndürerek Christopher ile Tony arasında tehlikeli bir krize yol açar.', airDate: '2004-04-04', introStart: 0, introEnd: 35, videoFileName: vid(5, 5) },
      { id: epId(5, 6), season: 5, episode: 6, title: 'Sentimental Education', titleTr: 'Duygusal Eğitim', description: 'Carmela, A.J.\'nin rehberlik danışmanı Mr. Wegler ile yakınlaşır. Tony B ise masaj salonu hayalinden uzaklaşıp kolay paranın cazibesine kapılır.', airDate: '2004-04-11', introStart: 0, introEnd: 35, videoFileName: vid(5, 6) },
      { id: epId(5, 7), season: 5, episode: 7, title: 'In Camelot', titleTr: 'Camelot\'ta', description: 'Tony, babasının eski metresi Fran Felstein ile tanışır ve geçmişteki çocukluk anılarının gerçek yüzüyle yüzleşmek zorunda kalır.', airDate: '2004-04-18', introStart: 0, introEnd: 35, videoFileName: vid(5, 7) },
      { id: epId(5, 8), season: 5, episode: 8, title: 'Marco Polo', titleTr: 'Marco Polo', description: 'Carmela\'nın babası için düzenlenen büyük doğum günü partisi, Tony ve Carmela\'yı kısa süreliğine de olsa eski günlerdeki gibi bir araya getirir.', airDate: '2004-04-25', introStart: 0, introEnd: 35, videoFileName: vid(5, 8) },
      { id: epId(5, 9), season: 5, episode: 9, title: 'Unidentified Black Males', titleTr: 'Kimliği Belirsiz Siyah Erkekler', description: 'Tony B, New York ailesindeki husumete dâhil olarak büyük bir kriz yaratır. Meadow\'un erkek arkadaşı Finn, şantiyede sarsıcı bir olaya tanık olur.', airDate: '2004-05-02', introStart: 0, introEnd: 35, videoFileName: vid(5, 9) },
      { id: epId(5, 10), season: 5, episode: 10, title: 'Cold Cuts', titleTr: 'Soğuk Kesimler', description: 'Janice öfke yönetimi derslerinde ilerleme kaydetmeye çalışırken, Tony bu durumu kabullenmekte zorlanır. Tony B işleri daha da içinden çıkılmaz bir hale getirir.', airDate: '2004-05-09', introStart: 0, introEnd: 35, videoFileName: vid(5, 10) },
      { id: epId(5, 11), season: 5, episode: 11, title: 'The Test Dream', titleTr: 'Test Rüyası', description: 'Lüks bir otel odasında dinlenmeye çalışan Tony, bilinçaltının derinliklerinden gelen uzun, sürreal ve kehanet dolu rüyalarla boğuşur.', airDate: '2004-05-16', introStart: 0, introEnd: 35, videoFileName: vid(5, 11) },
      { id: epId(5, 12), season: 5, episode: 12, title: 'Long Term Parking', titleTr: 'Uzun Süreli Park', description: 'FBI\'ın Adriana üzerindeki baskısı son raddeye ulaşır; köşeye sıkışan Adriana, her şeyi sonsuza dek değiştirecek hayati bir hamle yapmak zorunda kalır.', airDate: '2004-05-23', introStart: 0, introEnd: 35, videoFileName: vid(5, 12) },
      { id: epId(5, 13), season: 5, episode: 13, title: 'All Due Respect', titleTr: 'Tüm Saygılarımla', description: 'Kuzeni Tony B\'nin eylemleri yüzünden New York ile savaşın eşiğine gelen Tony, kendi ailesini korumak için en zor kararlardan birini verir.', airDate: '2004-06-06', introStart: 0, introEnd: 35, videoFileName: vid(5, 13) },
    ],
  },
  {
    number: 6,
    title: 'Season 6',
    titleTr: 'Sezon 6',
    description: 'Soprano ailesinin hikayesi kapanışa doğru ilerlerken, ihanetler, trajediler ve kaçınılmaz yüzleşmeler herkesi kökünden sarsar.',
    year: '2006-2007',
    episodeCount: 21,
    episodes: [
      { id: epId(6, 1), season: 6, episode: 1, title: 'Members Only', titleTr: 'Sadece Üyelere', description: 'Büyük bir miras alan Eugene yeraltı dünyasından ayrılmak ister. Junior\'ın akıl sağlığındaki çöküş, tüm aileyi şoke eden bir olayla sonuçlanır.', airDate: '2006-03-12', introStart: 0, introEnd: 35, videoFileName: vid(6, 1) },
      { id: epId(6, 2), season: 6, episode: 2, title: 'Join the Club', titleTr: 'Kulübe Katıl', description: 'Tony bir hastane yatağında yaşam mücadelesi verirken, zihni Kevin Finnerty adında sıradan bir adam olarak alternatif bir gerçeklikte dolaşır.', airDate: '2006-03-19', introStart: 0, introEnd: 35, videoFileName: vid(6, 2) },
      { id: epId(6, 3), season: 6, episode: 3, title: 'Mayham', titleTr: 'Kaos', description: 'Tony olmadan yönsüz kalan ekip içinde gerilim artarken, Paulie ve Silvio liderlik boşluğunda kendi çıkarlarını korumaya çalışır.', airDate: '2006-03-26', introStart: 0, introEnd: 35, videoFileName: vid(6, 3) },
      { id: epId(6, 4), season: 6, episode: 4, title: 'The Fleshy Part of the Thigh', titleTr: 'Uyluğun Etli Kısmı', description: 'Hastanede toparlanmaya başlayan Tony, hayatın anlamına dair yeni bir bakış açısı kazanır. Paulie ise kökleriyle ilgili sarsıcı bir sır öğrenir.', airDate: '2006-04-02', introStart: 0, introEnd: 35, videoFileName: vid(6, 4) },
      { id: epId(6, 5), season: 6, episode: 5, title: 'Mr. & Mrs. John Sacrimoni Request...', titleTr: 'Bay ve Bayan John Sacrimoni Rica Eder...', description: 'Johnny Sack, kızının düğününe katılabilmek için hapisten kısa süreliğine özel izin alır ancak olaylar beklediği kadar gurur verici geçmez.', airDate: '2006-04-09', introStart: 0, introEnd: 35, videoFileName: vid(6, 5) },
      { id: epId(6, 6), season: 6, episode: 6, title: 'Live Free or Die', titleTr: 'Özgür Yaşa ya da Öl', description: 'Vito ile ilgili yayılan skandal dedikodular hem New Jersey hem de New York çevrelerinde büyük yankı uyandırır ve onu kaçmaya zorlar.', airDate: '2006-04-16', introStart: 0, introEnd: 35, videoFileName: vid(6, 6) },
      { id: epId(6, 7), season: 6, episode: 7, title: 'Luxury Lounge', titleTr: 'Lüks Salon', description: 'Christopher mafya bağlantılarını kullanarak Hollywood\'da film projeleri peşinde koşarken, Artie restoranı Vesuvio\'nun saygınlığını geri kazanmaya çalışır.', airDate: '2006-04-23', introStart: 0, introEnd: 35, videoFileName: vid(6, 7) },
      { id: epId(6, 8), season: 6, episode: 8, title: 'Johnny Cakes', titleTr: 'Johnny Kekleri', description: 'Vito, New Hampshire\'da geçmişinden uzakta sessiz bir hayat kurmaya çalışırken, Tony gayrimenkul işleriyle meşguldür.', airDate: '2006-04-30', introStart: 0, introEnd: 35, videoFileName: vid(6, 8) },
      { id: epId(6, 9), season: 6, episode: 9, title: 'The Ride', titleTr: 'Yolculuk', description: 'Paulie masraftan kısmak için festivaldeki panayır aletlerinde güvenlik riskleri alır. Christopher\'ın bağımlılıkla savaşı zorlu bir dönemece girer.', airDate: '2006-05-07', introStart: 0, introEnd: 35, videoFileName: vid(6, 9) },
      { id: epId(6, 10), season: 6, episode: 10, title: "Moe n' Joe", titleTr: "Moe ve Joe", description: 'Vito sürgündeki hayatının kendisine göre olmadığını fark ederek tehlikeli bir karar alır. Johnny Sack hukuki mücadelesinde sona yaklaşır.', airDate: '2006-05-14', introStart: 0, introEnd: 35, videoFileName: vid(6, 10) },
      { id: epId(6, 11), season: 6, episode: 11, title: 'Cold Stones', titleTr: 'Soğuk Taşlar', description: 'Carmela ve Rosalie, Paris\'e giderek ufuklarını açarlar. Bu sırada New Jersey\'de Phil Leotardo\'nun öfkesi yıkıcı bir boyuta ulaşır.', airDate: '2006-05-21', introStart: 0, introEnd: 35, videoFileName: vid(6, 11) },
      { id: epId(6, 12), season: 6, episode: 12, title: 'Kaisha', titleTr: 'Kaisha', description: 'Christopher gizli bir romantik ilişkiye yelken açar ancak bu durum suları bulandırır. Tony kendi içsel çatışmalarıyla yüzleşmeye devam eder.', airDate: '2006-06-04', introStart: 0, introEnd: 35, videoFileName: vid(6, 12) },
      { id: epId(6, 13), season: 6, episode: 13, title: 'Soprano Home Movies', titleTr: 'Soprano Ev Filmleri', description: 'Tony\'nin doğum günü için göl evinde toplanan ailenin huzuru, sarhoşça geçen bir gecenin ardından eski kırgınlıkların su yüzüne çıkmasıyla bozulur.', airDate: '2007-04-08', introStart: 0, introEnd: 35, videoFileName: vid(6, 13) },
      { id: epId(6, 14), season: 6, episode: 14, title: 'Stage 5', titleTr: 'Evre 5', description: 'Christopher\'ın filmi "Cleaver" izleyiciyle buluşur ancak filmin alt metni Tony\'yi rahatsız eder. Hapishanedeki Johnny Sack kritik bir dönemece girer.', airDate: '2007-04-15', introStart: 0, introEnd: 35, videoFileName: vid(6, 14) },
      { id: epId(6, 15), season: 6, episode: 15, title: 'Remember When', titleTr: 'Hatırla', description: 'Eski bir cesedin bulunma ihtimali Tony ve Paulie\'yi Florida\'ya gitmeye zorlar; bu yolculukta Tony, Paulie\'nin sadakatini sessizce sınar.', airDate: '2007-04-22', introStart: 0, introEnd: 35, videoFileName: vid(6, 15) },
      { id: epId(6, 16), season: 6, episode: 16, title: 'Chasing It', titleTr: 'Peşinde Koşmak', description: 'Tony, kötü giden bahislerin ve kumar borçlarının etkisiyle giderek daha agresifleşir. Vito\'nun oğlu babasının yokluğuyla başa çıkmakta zorlanır.', airDate: '2007-04-29', introStart: 0, introEnd: 35, videoFileName: vid(6, 16) },
      { id: epId(6, 17), season: 6, episode: 17, title: 'Walk Like a Man', titleTr: 'Adam Gibi Yürü', description: 'A.J. ağır bir depresyon sarmalına girerken, Christopher ve Paulie arasındaki kişisel husumet tehlikeli bir şekilde kontrolden çıkar.', airDate: '2007-05-06', introStart: 0, introEnd: 35, videoFileName: vid(6, 17) },
      { id: epId(6, 18), season: 6, episode: 18, title: 'Kennedy and Heidi', titleTr: 'Kennedy ve Heidi', description: 'Yıkıcı bir trafik kazasının ardından Tony, hem fiziksel hem de ruhsal olarak her şeyden uzaklaşmak için Las Vegas\'ta sürreal bir yolculuğa çıkar.', airDate: '2007-05-13', introStart: 0, introEnd: 35, videoFileName: vid(6, 18) },
      { id: epId(6, 19), season: 6, episode: 19, title: 'The Second Coming', titleTr: 'İkinci Geliş', description: 'A.J.\'nin umutsuzluğu eyleme dönüşürken aile perişan olur. Aynı zamanda Tony, New York ile olan sürtüşmenin artık diplomasiyle çözülemeyeceğini anlar.', airDate: '2007-05-20', introStart: 0, introEnd: 35, videoFileName: vid(6, 19) },
      { id: epId(6, 20), season: 6, episode: 20, title: 'The Blue Comet', titleTr: 'Mavi Kuyruklu Yıldız', description: 'Phil Leotardo\'nun başlattığı savaş Soprano ekibini hazırlıksız yakalar. Güvende kalmak için herkes saklanırken geride acı kayıplar bırakılır.', airDate: '2007-06-03', introStart: 0, introEnd: 35, videoFileName: vid(6, 20) },
      { id: epId(6, 21), season: 6, episode: 21, title: 'Made in America', titleTr: 'Amerika\'da Yapıldı', description: 'Tony ve ailesi savaşın son demlerinde ayakta kalmaya çalışırken, New York ile olan çatışmaya nihai bir çözüm arayışı başlar. Her şeyin bir sonu vardır.', airDate: '2007-06-10', introStart: 0, introEnd: 35, videoFileName: vid(6, 21) },
    ],
  },
];

// Helper fonksiyonlar
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

  // Sonraki sezona geç
  const nextSeason = getSeasonByNumber(seasonNumber + 1);
  return nextSeason?.episodes[0];
}

export function getPreviousEpisode(seasonNumber: number, episodeNumber: number): Episode | undefined {
  const season = getSeasonByNumber(seasonNumber);
  if (!season) return undefined;

  const prevEp = season.episodes.find((e) => e.episode === episodeNumber - 1);
  if (prevEp) return prevEp;

  // Önceki sezona geç
  const prevSeason = getSeasonByNumber(seasonNumber - 1);
  return prevSeason?.episodes[prevSeason.episodes.length - 1];
}

// Cloudflare R2 CDN base URL (.env'den gelir)
// R2 public access açıkken: https://pub-xxxx.r2.dev
// Custom domain bağlandıktan sonra: https://cdn.sizindomain.com
const R2_BASE = (import.meta.env.VITE_R2_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function getVideoUrl(episode: Episode): string {
  const ss = String(episode.season).padStart(2, '0');
  const ee = String(episode.episode).padStart(2, '0');
  const seasonFolder = `S${episode.season}`;
  const fileName = `S${ss}E${ee}.mp4`;

  if (R2_BASE) {
    return `${R2_BASE}/${encodeURIComponent(seasonFolder)}/${fileName}`;
  }
  return `/videos/${seasonFolder}/${fileName}`;
}

export function getSubtitleUrl(episode: Episode, lang: 'tr' | 'en' = 'tr'): string {
  const ss = String(episode.season).padStart(2, '0');
  const ee = String(episode.episode).padStart(2, '0');
  const seasonFolder = `S${episode.season}`;
  const fileName = `S${ss}E${ee}${lang === 'en' ? '.en.srt' : '.srt'}`;

  if (R2_BASE) {
    return `${R2_BASE}/${encodeURIComponent(seasonFolder)}/${fileName}`;
  }
  return `/videos/${seasonFolder}/${fileName}`;
}

export const totalEpisodes = seasons.reduce((sum, s) => sum + s.episodeCount, 0);
