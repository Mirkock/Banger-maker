/* Banger Maker — listas de palabras para las rimas.
   Formato: palabra  o  palabra|cómo suena  (para nombres, marcas e inglés).
   En nombres de varias palabras, «cómo suena» es solo la última (la que rima).
   Estas listas son un punto de partida: lo que falte lo agregás en «Mi diccionario». */
(function (root) {
  'use strict';
  const P = s => s.split(',').map(x => x.trim()).filter(Boolean).map(x => {
    const i = x.indexOf('|');
    return i < 0 ? { w: x } : { w: x.slice(0, i).trim(), say: x.slice(i + 1).trim() };
  });

  const D = { famosos: {} };

  /* palabras de todos los días */
  D.comun = P(`
    amor, dolor, calor, color, valor, error, honor, favor, motor, sabor, temblor, rencor, fervor, sudor, mayor, menor, mejor,
    peor, señor, humor, corazón, canción, razón, pasión, ilusión, emoción, misión, visión, traición, prisión, tensión, atención,
    decisión, versión, lección, acción, mañana, semana, ventana, campana, hermana, cama, llama, fama, drama, trama, gana, lana,
    rama, sana, sultana, manzana, cielo, suelo, vuelo, miedo, credo, dedo, enredo, sendero, dinero, entero, primero, verdadero,
    pasajero, guerrero, viajero, callejero, noche, coche, broche, derroche, reproche, calle, valle, detalle, talle, hable, cable,
    mesa, promesa, sorpresa, certeza, belleza, tristeza, firmeza, riqueza, pobreza, grandeza, fuerza, fuerte, muerte, suerte,
    verte, perderte, quererte, tenerte, tiempo, viento, cuento, intento, momento, lamento, aliento, talento, sentimiento,
    pensamiento, movimiento, argumento, cemento, vida, herida, salida, caída, partida, huida, comida, bebida, medida, subida,
    bajada, llegada, mirada, jugada, pisada, pelada, parada, soñar, volar, cantar, bailar, llorar, luchar, buscar, pensar, mirar,
    hablar, besar, tocar, probar, ganar, gastar, pasar, brillar, caminar, escapar, olvidar, recordar, rimar, mostrar, esperar,
    empezar, terminar, correr, vencer, perder, saber, poder, querer, tener, hacer, ver, ser, volver, caer, creer, crecer, nacer,
    vivir, sentir, seguir, partir, decir, pedir, medir, sufrir, subir, escribir, cumplir, vestir, cantaba, soñaba, miraba,
    esperaba, buscaba, pensaba, bajaba, volaba, lloraba, bailaba, cantando, soñando, mirando, buscando, pensando, bajando,
    volando, llorando, bailando, corriendo, viviendo, sintiendo, creciendo, perdiendo, cantado, soñado, mirado, buscado, pensado,
    bajado, volado, llorado, bailado, pasado, pecado, mercado, ganado, cuidado, enfado, estado, soldado, dado, lado, prado,
    camino, destino, vecino, divino, fino, vino, sino, pino, cariño, niño, barrio, rubio, odio, medio, remedio, asedio, estudio,
    silencio, presencia, ausencia, paciencia, violencia, conciencia, experiencia, esencia, vivencia, creencia, luz, cruz, paz,
    voz, veloz, atroz, feroz, capaz, audaz, tenaz, sagaz, vez, pez, tez, rapidez, madurez, niñez, vejez, altivez, sencillez,
    mundo, profundo, segundo, vagabundo, inmundo, fecundo, rotundo, moribundo, fondo, hondo, redondo, respondo, escondo, fuego,
    juego, luego, ruego, riego, ciego, apego, pliego, entrego, niego, llego, pego, sosiego, sangre, hambre, nombre, hombre,
    madre, padre, cobre, pobre, noble, doble, nube, sube, cuerpo, cuervo, siervo, tierno, eterno, invierno, infierno, cuaderno,
    moderno, interno, gobierno, mente, gente, siempre, tiente, frente, fuente, puente, ausente, presente, caliente, valiente,
    creciente, naciente, imprudente, paciente, contenta, cuenta, afrenta, lenta, verdad, ciudad, libertad, amistad, realidad,
    felicidad, soledad, humildad, maldad, bondad, edad, mitad, necesidad, oportunidad, unidad, voluntad, ansiedad, claridad,
    sociedad, perro, cerro, hierro, yerro, encierro, entierro, burro, puerro, zorro, gorro, torre, corre, borre, vuela, escuela,
    suela, abuela, tela, vela, estela, cela, tutela, historia, memoria, victoria, gloria, euforia, escoria, trayectoria, euro,
    futuro, oscuro, seguro, duro, puro, muro, apuro, maduro, impuro, perjuro, juro, aseguro, calma, alma, palma, salmo, balsa,
    falsa, salsa, pasta, basta, gasta, casta, hasta, contrasta, resta, fiesta, siesta, orquesta, protesta, respuesta, apuesta,
    ritmo, himno, cinismo, abismo, sismo, mismo, egoísmo, optimismo, pesimismo, realismo, activismo, nada, nunca, todo, algo,
    alguien, nadie, jamás, quizás, además, atrás, detrás, demás, compás, rapaz, sol, farol, control, rol, gol, caracol, alcohol,
    girasol, rock|rrók, flash|flás, club|clúb, show|shóu, fan|fán, plata, lata, mata, pata, bata, corbata, regata, serenata,
    sonata, pirata, bravata, desata, retrata, maltrata, ingrata, beata, culata, aguata, gato, pato, rato, plato, trato, contrato,
    retrato, barato, relato, dato, zapato, desacato, olfato, insensato, mato, cato, ato, mulato, casita, cosita, chiquita,
    bonita, bendita, favorita, cajita, ratito, bonito, chiquito, finito, infinito, delito, exquisito, bendito, maldito, escrito,
    grito, rito, mito, pito, poquito, solito, solita, bajito, bajita, despacito, despacita, lindito, rapidito, momentito,
    trapero, rapero, lisonjero, bolsillero, bandera, manera, carretera, frontera, calavera, era, fiera, espera, quimera,
    cualquiera, primera, sincera, ligera, pradera, escalera, cartera, madera, ojalera, rastrera, fuera, hoguera, ladera, ribera,
    vereda, ceguera, libreta, maleta, galleta, camioneta, bicicleta, poeta, profeta, planeta, cometa, trompeta, silueta, cuneta,
    saeta, paleta, etiqueta, secreta, completa, discreta, inquieta, violeta, cadeneta, muleta, jugueta, boleta, cabeza, receta,
    escopeta, chaqueta, banqueta, maqueta, careta, peseta, secreto, completo, discreto, perfecto, objeto, sujeto, proyecto,
    respeto, afecto, efecto, defecto, directo, correcto, exacto, abstracto, contacto, pacto, tacto, acto, concreto, inquieto,
    repleto, soneto, esqueleto, panfleto, chaleco, cuarteto, alfabeto, indiscreto, prospecto, aspecto, dialecto, insecto,
    derecho, techo, pecho, hecho, estrecho, provecho, deshecho, sospecho, cosecho, desecho, barbecho, trecho, ancho, mancho,
    gancho, rancho, lecho, flecha, brecha, mecha, fecha, trecha, cosecha, derecha, estrecha, sospecha, lucha, escucha, mucha,
    ducha, bicho, dicho, ocho, mochila, hilacha, muchacho, muchacha, cacho, macho, gacho, facha, racha, tacha, ficha, nacho,
    bochorno, castillo, cuchillo, bolsillo, anillo, brillo, caudillo, amarillo, bombillo, tobillo, rodilla, orilla, semilla,
    mejilla, mancilla, astilla, ardilla, polilla, pandilla, cuadrilla, sencilla, pastilla, tortilla, parrilla, maravilla, villa,
    silla, arcilla, costilla, cosquilla, rastrillo, martillo, ladrillo, grillo, bocadillo, pillo, tornillo, colmillo, sombrilla,
    rodillo, cepillo, novillo, manillar, banquillo, flequillo, cuchilla, rencilla, rendija, hermoso, famoso, peligroso, precioso,
    curioso, celoso, furioso, glorioso, hermosa, rosa, cosa, diosa, mariposa, esposa, fosa, prosa, osa, mimosa, fabulosa,
    ansioso, orgulloso, cuidadoso, silencioso, sabroso, cariñoso, lujoso, nervioso, poderoso, gozoso, perezoso, maravilloso,
    misterioso, espantoso, asombroso, tenebroso, ocioso, rabioso, sudoroso, vicioso, jugoso, amoroso, doloroso, ruidoso, poroso,
    jabonoso, locura, ternura, dulzura, altura, cultura, aventura, figura, cura, pura, dura, segura, madura, oscura, hermosura,
    frescura, costura, tortura, textura, premura, fractura, estructura, armadura, cintura, criatura, apertura, censura, andadura,
    basura, lectura, escritura, finura, rotura, factura, sutura, ranura, mesura, artista, pista, lista, vista, conquista,
    dentista, taxista, futbolista, optimista, pesimista, activista, bromista, trista, exista, insista, resista, persista, asista,
    consista, turista, pianista, guitarrista, bajista, rapista, humorista, periodista, maquinista, novelista, protagonista,
    equipista, pagista, música, rico, pico, chico, mágico, trágico, cómico, lógico, físico, único, clásico, público, básico,
    práctico, típico, ético, plástico, fantástico, elástico, magnífico, pacífico, específico, simpático, eléctrico, dramático,
    automático, romántico, atlántico, histórico, rústico, científico, económico, político, ártico, cósmico, poesía, compañía,
    policía, día, alegría, fantasía, melodía, tía, guía, vía, mía, sabía, tenía, quería, podía, hacía, decía, venía, vivía,
    sentía, salía, corría, creía, vería, estaría, sería, había, sabría, haría, diría, pondría, querría, vendría, tendría,
    valdría, sonría, confía, vacía, bahía, energía, cobardía, hipocresía, travesía, sinfonía, armonía, amar, jugar, andar, dejar,
    llamar, llevar, tomar, sacar, parar, quedar, lograr, gritar, brotar, matar, lanzar, alcanzar, abrazar, cruzar, rezar,
    tropezar, comenzar, danzar, cazar, gozar, pisar, ayudar, mejorar, ignorar, adorar, evitar, tratar, ocupar, llenar, cambiar,
    odiar, rodear, sentar, cansar, usar, jurar, curar, cuidar, mandar, regalar, tirar, cortar, tapar, pegar, pagar, apagar,
    prender, entender, ceder, mover, meter, ofrecer, merecer, obedecer, aparecer, parecer, padecer, agradecer, florecer, conocer,
    reconocer, desaparecer, amanecer, atardecer, anochecer, entristecer, envejecer, resolver, devolver, envolver, atender,
    defender, ascender, descender, encender, extender, comprender, sorprender, aprender, romper, toser, beber, deber, temer,
    coser, barrer, comer, sorber, dormir, morir, abrir, cubrir, descubrir, recibir, resistir, existir, insistir, persistir,
    decidir, dividir, compartir, permitir, admitir, omitir, repetir, competir, servir, hervir, mentir, herir, reír, sonreír,
    huir, construir, destruir, distribuir, incluir, concluir, atribuir, discutir, aplaudir, convivir, sobrevivir, renacer,
    nación, relación, educación, creación, vibración, imaginación, generación, inspiración, conversación, celebración, devoción,
    situación, evolución, revolución, solución, institución, tradición, condición, posición, ambición, intuición, adicción,
    ficción, fricción, dirección, protección, conexión, reflexión, expresión, impresión, sesión, depresión, confesión, obsesión,
    posesión, ocasión, explosión, invasión, conclusión, confusión, difusión, afición, petición, cuestión, fusión, ladrón, patrón,
    león, melón, campeón, balcón, limón, jabón, colchón, bastón, camión, millón, buzón, cañón, pantalón, calzón, montón, tapón,
    avión, perdón, don, son, sillón, salón, tiburón, gorrión, bolsón, pulmón, ratón, glotón, aprendiz, timón, telón, fogón,
    algodón, escalón, pelotón, cajón, jamón, ciclón, tobogán, motón, listón, tazón, torreón, rincón, bufón, pregón, hermano,
    mano, humano, verano, temprano, lejano, cercano, antiguo, liviano, cristiano, villano, pagano, gusano, enano, anciano,
    ciudadano, soberano, mundano, océano, urbano, sano, vano, llano, plano, insano, bajo, trabajo, atajo, ventaja, mensaje,
    viaje, paisaje, coraje, ropaje, lenguaje, salvaje, personaje, homenaje, equipaje, masaje, tatuaje, aprendizaje, hospedaje,
    plumaje, ensamblaje, real, igual, total, final, mortal, normal, natural, especial, general, genial, fatal, sal, mal, canal,
    animal, carnaval, festival, ritual, cristal, metal, pedal, portal, capital, hospital, central, sensual, casual, usual,
    actual, brutal, vital, dental, lateral, criminal, original, fundamental, sentimental, instrumental, papel, fiel, miel, hotel,
    cruel, laurel, cartel, pastel, rebelde, burdel, clavel, plantel, cinturón, anzuelo, fácil, difícil, útil, civil, mil, vil,
    fusil, perfil, reptil, febril, sutil, gentil, juvenil, atril, español, azul, baúl, tul, sur, norte, feliz, raíz, matiz,
    nariz, cicatriz, actriz, lombriz, perdiz, directriz, infeliz, codorniz, tempestad, intensidad, curiosidad, eternidad,
    vanidad, pared, red, sed, merced, pan, plan, van, tan, clan, can, gran, galán, capitán, afán, huracán, volcán, sultán, imán,
    refrán, azafrán, tren, bien, también, edén, andén, desdén, estén, vaivén, belén, sostén, tropezón, sin, fin, jardín, motín,
    festín, delfín, confín, botín, atún, algún, común, ningún, alguno, ninguno, sus, mis, tus, dos, vos, nos, dios, adiós, tos,
    mes, pies, ves, tres, después, revés, través, interés, cortés, inglés, francés, holandés, país, anís, maíz, amas, ganas,
    nadas, cosas, rosas, ojos, locos, todos, nosotros, vosotros, ellos, aquellos, cielos, sueños, besos, versos, rimas, barrios,
    calles, ciudades, noches, días, sueño, dueño, pequeño, diseño, empeño, leño, risueño, isleño, porteño, brasileño, ribereño,
    ensueño, desdeño, cabeceo, deseo, paseo, empleo, trofeo, museo, aseo, peleo, rodeo, goteo, hoy, soy, voy, estoy, doy, rey,
    ley, buey, muy, hay, ay, guay, paraguay, uruguay, jersey, convoy, ola, sola, cola, bola, rola, pistola, guitarra, jarra,
    farra, barra, garra, marra, cigarra, zamarra, chicharra, diario, diccionario, silenciario, vario, contrario, ordinario,
    extraordinario, necesario, millonario, propietario, rosario, calendario, itinerario, secretario, voluntario, solitario,
    quiero, espero, tiro, miro, giro, suspiro, respiro, retiro, vampiro, zafiro, beso, preso, queso, exceso, proceso, progreso,
    regreso, acceso, suceso, ileso, expreso, impreso, confeso, travieso, rima, cima, clima, prima, estima, última, lima, mima,
    anima, sima, opima, vamos, estamos, seamos, tengamos, hagamos, digamos, pongamos, vayamos, queramos, podamos, sepamos,
    cuando, mientras, entonces, aunque, porque, sobre, desde, hacia, entre, contra, ante, tras, flaco, taco, saco, paco, pavo,
    bravo, clavo, esclavo, centavo, octavo, fábrica, mecánica, orquídea, amaneció, atardeció, anocheció, tormenta, menta, renta,
    venta, intenta, aumenta, aguanta, canta, planta, manta, santa, tanta, garganta, espanta, levanta, pelea, idea, fea, vea, sea,
    crea, lea, marea, tarea, odisea, playa, raya, maya, haya, vaya, ensaya, bataya, atalaya, malaya, medalla, calla, valla,
    talla, batalla, muralla, toalla, metralla, canalla, paella, nubes, cubos, tubos, canto, manto, tanto, santo, quebranto,
    espanto, encanto, llanto, acanto, mundial, musical, vertical, tropical, jovial, local, social
  `);

  /* palabras más cultas */
  D.formal = P(`
    incertidumbre, inexorable, efímero, utopía, melancolía, nostalgia, trascendencia, resiliencia, perseverancia, ambigüedad,
    paradoja, metáfora, esperanza, desesperanza, venganza, confianza, balanza, templanza, bonanza, andanza, matanza, danza,
    enseñanza, alabanza, semejanza, lanza, existencia, inocencia, indulgencia, elocuencia, apariencia, insolencia, omnipotencia,
    clemencia, resistencia, persistencia, coherencia, transparencia, inmortal, eternal, celestial, espiritual, emocional,
    personal, mental, esencial, ancestral, bestial, glacial, ideal, inconsciente, trascendente, omnipresente, inteligente,
    contundente, decadente, dominante, constante, brillante, vibrante, delirante, fascinante, abundante, designio, desvelo,
    anhelo, desengaño, desamparo, desencanto, desencuentro, desafío, desborde, derrumbe, naufragio, laberinto, horizonte, oleaje,
    filosofía, geografía, biografía, cofradía, ironía, apología, teología, ideología, cronología, humanidad, cualidad,
    inmensidad, identidad, ceguedad, falsedad, ejemplo, templo, contemplo, comienzo, debajo, abajo, trabajador, escritor,
    creador, soñador, ganador, vencedor, conquistador, narrador
  `);

  /* palabras de la calle */
  D.informal = P(`
    guita, laburo, laburar, bondi, birra, previa, boliche, joda, jodido, quilombo, bardo, lío, cagada, mambo, bolsa, flaca, loco,
    loca, gordo, gorda, tipo, tipa, mina, pibe, piba, chabón, chabona, amigo, amiga, socio, compa, compañero, vieja, viejo, vago,
    vaga, grosso, groso, capo, genio, crack, campeona, bestia, monstruo, bomba, joya, divina, lindo, linda, piola, copado,
    copada, zarpado, zarpada, tranqui, tranquilo, loquito, loquita, pillín, canchero, cancherito, cachivache, bobo, boba, tonto,
    tonta, morfar, morfi, chupar, fumar, fumada, pucho, porro, trago, copa, chela, fernet, mate, facturas, asado, choripán,
    empanada, milanesa, rescate, rescatarse, bancar, bancá, aguantar, aguante, fiaca, pereza, banco, ponerse, pasarla, tirarse,
    mandarse, chamuyo, chamuyar, mentira, chanta, trucho, trucha, trampa, truco, afano, afanar, robo, roba, choreo, chorro, cana,
    yuta, cobani, cobana, chau, ciao, dale, listo, bueno, buenísimo, de una, ya fue, nada que ver, ni ahí, al pedo, al toque,
    a full, re, requete, celular, compu, auto, moto, bici, subte, colectivo, remís, taxi, uber
  `);

  /* jerga: lunfardo, calle, trap, gamer, internet */
  D.jerga = P(`
    luca, gamba, mango, palo, bocha, bolonqui, despelote, kilombo, boludo, boludez, pelotudo, forro, gil, otario, salame, nabo,
    nabazo, pibito, pibardo, piberío, guacho, guachín, chabonazo, minita, pendejo, purrete, mocoso, tano, gallego, chamuyero,
    cuentero, mentiroso, truchada, curro, tragar, bajón, bajar, pasarse, zarpar, zarpe, rescatado, afanador, chorrear, chorreo,
    mechero, punga, pungueo, escruche, escruchante, gorra, botón, batidor, bobi, rati, fierro, caño, tumba, faca, chumbo, fusa,
    tirito, balazo, bala, plomo, faso, falopa, merca, tuca, porrito, pitada, humo, picar, pique, piolita, copar, cheto, cheta,
    caradura, atorrante, atorrar, flaquito, capito, grosa, mostro, cumbia, villero, villera, barrabrava, hincha, tribuna,
    popular, cancha, potrero, firme, fierita, de más, de ley, de fierro, re loco, en pedo, bien ahí, laburante, rebusque,
    rebuscarse, changa, changuita, changador, vento, ventear, ventanear, ventilar, viajado, tirado, tirate, gatito, gatear,
    gatillo, gatillero, morocho, morocha, tuerto, rengo, cabezón, chamamé, bailanta, bolichero, bailongo, jodón, tarasca,
    mangaso, noob|núb, gg|yiyí, lag|lág, hater|jéiter, crush|crásh, flex|fléx, swag|suág, drip|dríp, cringe|crínsh,
    random|rándom, like|láik, stream|strím, streamer|stríimer, bro|brou, man|mán, boss|bós, level|lével, rank|ránk,
    tryhard|traijárd, main|méin, skin|skín, spawn|spón, trap|tráp, beat|bít, flow|flou, freestyle|frístail, rapper|ráper,
    mc|emesé, dj|diyéi, feat|fít, hit|jít, banger|bánguer, drill|dríl, boom bap|bómbap
  `);

  /* marcas */
  D.marcas = P(`
    Nike|náiki, Adidas|adídas, Puma|púma, Jordan|yordán, Reebok|rríbok, Fila|fíla, Converse|convérs, Vans|báns, Topper|tópper,
    Gucci|gúchi, Prada|prada, Versace|versáchi, Balenciaga|balensiága, Louis Vuitton|vitón, Chanel|chanél, Dior|diór,
    Fendi|féndi, Supreme|suprím, Yeezy|yízi, Off-White|ofguáit, Lacoste|lacóst, Levi's|lívais, Zara|sára, Rolex|rrólex,
    Cartier|cartiér, Apple|ápel, iPhone|áifon, Samsung|sámsung, Motorola|motoróla, Xiaomi|chaomi, Netflix|nétflis,
    Spotify|spotifái, YouTube|yutúb, Instagram|ínstagram, TikTok|tiktók, WhatsApp|guatsáp, Twitter|tuíter, Facebook|féisbuk,
    Google|gúgel, PlayStation|pleisteishon, Xbox|ékisbox, Nintendo|nintendo, Fortnite|fortnáit, Roblox|róblox,
    Minecraft|máincraft, Steam|stím, Twitch|tuích, Discord|discórd, Coca|cóca, Pepsi|pépsi, Sprite|spráit, Fanta|fánta,
    Quilmes|quílmes, Brahma|bráma, Fernet|fernét, Branca|bránca, Heineken|jáineken, Red Bull|bul, Monster|mónster,
    Mercedes|mersédes, BMW|bemevé, Audi|áudi, Ferrari|ferrári, Lamborghini|lamborguíni, Porsche|pórsche, Tesla|tésla,
    Toyota|toyóta, Ford|fórd, Chevrolet|chevrolét, Uber|úber, Rappi|rápi, PedidosYa|pedídosya, Mercado Libre|líbre,
    Cabify|cabifái, MercadoPago|págo, Starbucks|starbáks, McDonald's|macdónals, Burger King|kíng, Yamaha|yamája, Honda|hónda,
    Harley|járli, Gillette|yilét, Ray-Ban|rrébán, Oakley|óukli, Casio|cásio, G-Shock|shók, Beats|bíts, JBL|yotabelé,
    Telecom|telecóm, Claro|cláro, Personal|personál, Movistar|movístar
  `);

  /* famosos: personajes de videojuegos */
  D.famosos.videojuegos = P(`
    Mario|mário, Luigi|luíyi, Bowser|báuser, Peach|pích, Yoshi|yóshi, Donkey Kong|kóng, Zelda|zélda, Link|línk,
    Ganondorf|gánondorf, Sonic|sónic, Tails|téils, Knuckles|nákols, Pikachu|pikachú, Charizard|charizárd, Mewtwo|miutú, Ash|ásh,
    Kirby|kírbi, Samus|sámus, Pac-Man|pacmán, Kratos|krátos, Atreus|átreus, Master Chief|chíf, Cortana|cortána, Lara Croft|króft,
    Nathan Drake|dréik, Joel|yóel, Ellie|éli, Geralt|yeralt, Ciri|síri, Cloud|cláud, Sephiroth|sefiróz, Mega Man|mán, Ryu|ríu,
    Ken|kén, Chun-Li|chunlí, Scorpion|scórpion, Sub-Zero|subsíro, Liu Kang|káng, Raiden|ráiden, Crash|crásh, Spyro|spáiro,
    Rayman|réiman, Solid Snake|snéik, Big Boss|bíg bós, Ezio|ésio, Altair|altaír, Gordon Freeman|frímon, GLaDOS|gládos,
    Steve|stíve, Creeper|críper, Enderman|énderman, Herobrine|jerobrái, Jonesy|yónsi, Peely|píli, Franklin|fránklin,
    Trevor|trévor, Michael|máicol, Arthur Morgan|mórgan, Dutch|dáuch, Leon|león, Ada|áda, Jill|yíl, Nemesis|némesis, Dante|dánte,
    Bayonetta|bayonéta, Isaac Clarke|clárk, Marcus Fenix|fénix, Tracer|tréiser, Mercy|mérsi, Reaper|ríper, Genji|yénji,
    Hanzo|jánso, Jett|yét, Sage|séich, Phoenix|fínix, Sova|sóva, Zeus|zéus, Poseidón, Hades|jádes, Ness|nés, Falco|fálco,
    Fox|fóx, Wario|uário, Waluigi|ualuíyi, Toad|tóud, Diddy|dídi, Pichu|pichú, Lucario|lucário, Greninja|greninya
  `);

  /* famosos: música argentina */
  D.famosos.musicaAR = P(`
    Duki, Trueno, Wos, Bizarrap|bizárrap, Cazzu|cásu, Nicki Nicole|nicól, Paulo Londra|lóndra, Tiago PZK|pezeká, FMK|efemecá,
    Lit Killah|kíla, Khea|kéa, Ysy A|isiá, Neo Pistea|pistéa, Dillom|dilóm, Callejero Fino|fíno, Nathy Peluso|peluso,
    Maria Becerra|becérra, Emilia Mernes|mérnes, Ca7riel|catriél, Paco Amoroso|amoróso, Lucho SSJ|esesyóta, Seven Kayne|káin,
    Acru|ácru, Gazir|gazír, Ecko|éco, Roze|rróse, Stuart|stuárt, Salastkbron|salástcabrón, Tobi|tóbi, Catriel|catriél,
    Rusherking|rásherking, Fer Vázquez|vázquez, Don Patricio|patrício, Lola Indigo|índigo, Cuarteto de Nos|nós,
    Charly García|garcía, Luis Alberto Spinetta|spinéta, Fito Páez|páez, Gustavo Cerati|cerátti, Soda Stereo|estéreo,
    Divididos|divididos, Los Redondos|redóndos, Indio Solari|solári, Patricio Rey|réi, Babasónicos|babasónicos, La Renga|rrénga,
    Rodrigo|rodrígo, La Mona Jiménez|jiménez, Gilda|gílda, Sandro|sándro, Los Piojos|piójos, Andrés Calamaro|calamáro, Skay|skái,
    Pappo|pápo, Los Fabulosos Cadillacs|cádilacs, Ricardo Arjona|arjóna, Lali|láli, Tini|tíni, Soledad|soledád,
    Mercedes Sosa|sósa, Atahualpa Yupanqui|yupánqui, Carlos Gardel|gardél, Astor Piazzolla|piazóla,
    Los Chalchaleros|chalchaléros, Los Auténticos Decadentes|decadéntes, Damas Gratis|grátis, Los Palmeras|palméras,
    Dalila|dalíla, Q'lokura|clokúra, Ke Personajes|personájes
  `);

  /* famosos: música de Estados Unidos y del mundo */
  D.famosos.musicaUS = P(`
    Eminem|eminém, Kendrick Lamar|lamár, Drake|dréik, Jay-Z|yeisí, Kanye West|guést, Travis Scott|skót, Tupac|tupák,
    Biggie|bígui, Nas|nás, J. Cole|kól, Lil Wayne|guéin, Snoop Dogg|dóg, 50 Cent|sént, Post Malone|malón, Dr. Dre|dré,
    Ice Cube|kiúb, Wiz Khalifa|kalífa, Future|fiúchur, Lil Pump|pámp, Nipsey Hussle|jásl, A$AP Rocky|róqui,
    Tyler the Creator|críeiter, Frank Ocean|óshan, Childish Gambino|gambíno, Chance the Rapper|ráper, Mac Miller|míler,
    Juice WRLD|yúrld, XXXTentacion|tentasión, Lil Uzi Vert|vért, Playboi Carti|cárti, Migos|mígos, Offset|ófset, Cardi B|bí,
    Nicki Minaj|mináy, Megan Thee Stallion|stálion, Doja Cat|cát, Lizzo|lízo, Beyoncé|beyonsé, Rihanna|riána,
    Michael Jackson|yáckson, Prince|príns, Madonna|madóna, Elvis|élvis, Bob Marley|márli, Bruno Mars|márs, The Weeknd|uíknd,
    Justin Bieber|bíber, Ed Sheeran|shíran, Taylor Swift|suíft, Billie Eilish|áilish, Ariana Grande|grándi, Dua Lipa|lípa,
    Harry Styles|stáils, Imagine Dragons|drágons, Coldplay|cóldplei, Metallica|metálica, Nirvana|nirvána, Kurt Cobain|cobéin,
    Queen|kuín, Freddie Mercury|mércuri, The Beatles|bítols, John Lennon|lénon, Bob Dylan|dílan, Jimi Hendrix|jéndrics,
    Led Zeppelin|zépelin, Pink Floyd|flóid, Guns N' Roses|róses, Bad Bunny|búni, Daddy Yankee|yánqui, J Balvin|bálvin,
    Karol G|yí, Anuel|anuél, Ozuna|osúna, Maluma|malúma, Don Omar|ómar, Wisin|uisín, Yandel|yandél, Shakira|shakíra,
    Residente|residénte
  `);

  /* famosos: fútbol */
  D.famosos.futbol = P(`
    Messi|mési, Maradona|maradóna, Riquelme|rriquélme, Di María|maría, Dibu Martínez|martínez, Mbappé|embapé,
    Cristiano Ronaldo|ronáldo, Neymar|neimár, Pelé|pelé, Cruyff|crói, Batistuta|batistúta, Crespo|créspo, Tevez|tévez,
    Agüero|agüéro, Higuaín|iguáin, Lautaro Martínez|martínez, Julián Álvarez|álvarez, Enzo Fernández|fernández,
    Mac Allister|alístair, De Paul|pául, Otamendi|otaméndi, Romero|rroméro, Fideo|fídeo, Kempes|kémpes, Passarella|pasaréla,
    Ardiles|ardíles, Zanetti|sanéti, Redondo|redóndo, Verón|verón, Simeone|simeóne, Boca|bóca, River|rríver, Racing|rrésing,
    Independiente|independiénte, San Lorenzo|lorénso, Estudiantes|estudiántes, Vélez|vélez, Newell's|niuéls, Central|sentrál,
    Talleres|tayéres, Gimnasia|gimnásia, Lanús|lanús, Banfield|bánfild, Huracán|uracán, Colón|colón, Unión|unión,
    Belgrano|belgráno, Rosario Central|sentrál, Tigre|tígre, Argentinos|argentínos, Real Madrid|madríd, Barcelona|barcelóna,
    Bayern|báiern, Liverpool|líverpul, Manchester|mánchester, Chelsea|chélsi, Juventus|yubéntus, Milan|milán, Inter|ínter,
    PSG|pesegé, Mundial|mundiál, Copa América|améirica, Libertadores|libertadóres, Champions|chámpions, Balón de Oro|óro,
    Bombonera|bomboneéra, Monumental|monumentál, Gambeta|gambéta, Golazo|golázo, Scaloni|scaloni, Bilardo|bilárdo,
    Menotti|menóti, Bielsa|biélsa, Mascherano|maskeráno, Palermo|palérmo, Román|rromán, Ortega|ortéga, Caniggia|caníya
  `);

  /* famosos: figuras históricas */
  D.famosos.historicos = P(`
    San Martín|martín, Belgrano|belgráno, Sarmiento|sarmiénto, Moreno|moréno, Rosas|rrósas, Juan Manuel de Rosas|rrósas,
    Roca|rróca, Yrigoyen|irigóyen, Perón|perón, Evita|evíta, Eva Perón|perón, Mitre|mítre, Alfonsín|alfonsín, Güemes|güémes,
    Artigas|artígas, Bolívar|bolívar, Sucre|súcre, O'Higgins|ojíns, Túpac Amaru|amárú, Moctezuma|moctesúma, Che Guevara|guevára,
    Fidel Castro|cástro, Simón Bolívar|bolívar, Napoleón|napoleón, Julio César|césar, Cleopatra|cleopátra, Alejandro Magno|mágno,
    Aníbal|aníbal, Atila|atíla, Gengis Kan|kán, Leonardo da Vinci|vínchi, Miguel Ángel|ángel, Picasso|picáso, Frida Kahlo|cálo,
    Dalí|dalí, Van Gogh|góg, Mozart|mósart, Beethoven|bétoven, Bach|bák, Einstein|áinstain, Newton|niúton, Galileo|galiléo,
    Darwin|dárguin, Tesla|tésla, Edison|édison, Marie Curie|kiurí, Freud|fróid, Nietzsche|nítche, Platón|platón,
    Sócrates|sócrates, Aristóteles|aristóteles, Cervantes|cervántes, Shakespeare|shéikspir, Borges|bórjes, Cortázar|cortásar,
    Neruda|nerúda, García Márquez|márquez, Quino|quíno, Mafalda|mafálda, Hitler|jítler, Stalin|stálin, Lenin|lénin,
    Churchill|chérchil, Lincoln|línkoln, Kennedy|kénedi, Martin Luther King|kíng, Gandhi|gándi, Mandela|mandéla, Colón|colón,
    Magallanes|magayánes
  `);

  /* famosos: cine, series y actores */
  D.famosos.cine = P(`
    Ricardo Darín|darín, Guillermo Francella|francéya, Leonardo Sbaraglia|sbaragía, Norma Aleandro|aleándro,
    Susana Giménez|giménez, Mirtha Legrand|legrán, Pablo Echarri|echárri, Natalia Oreiro|oréiro, Griselda Siciliani|sisiliáni,
    Darío Grandinetti|grandinéti, Gael García Bernal|bernál, Diego Luna|lúna, Salma Hayek|háyek, Penélope Cruz|krúz,
    Javier Bardem|bardén, Antonio Banderas|banderas, Al Pacino|pacíno, Robert De Niro|níro, Marlon Brando|brándo,
    Tom Hanks|jánks, Leonardo DiCaprio|dicáprio, Brad Pitt|pít, Johnny Depp|dép, Will Smith|smíz, Denzel Washington|guáshington,
    Morgan Freeman|frímon, Samuel L. Jackson|yáckson, Keanu Reeves|rrívs, Tom Cruise|krús, Arnold Schwarzenegger|schuarsenéguer,
    Sylvester Stallone|stalón, Bruce Willis|uílis, Jackie Chan|chán, Bruce Lee|lí, Jim Carrey|kéri, Robin Williams|uíliams,
    Eddie Murphy|mérfi, Dwayne Johnson|yónson, Vin Diesel|dísel, Scarlett Johansson|yohánson, Angelina Jolie|yolí,
    Jennifer Lawrence|lórens, Emma Watson|guátson, Zendaya|zendáya, Margot Robbie|róbi, Anne Hathaway|jázaguei,
    Meryl Streep|strip, Marilyn Monroe|monróe, Audrey Hepburn|jépbern, Charlie Chaplin|cháplin, Batman|bátman, Superman|súperman,
    Spider-Man|spáidermán, Iron Man|áirón mán, Joker|yóker, Thanos|zános, Darth Vader|véider, Yoda|yóda,
    Luke Skywalker|skáiuoker, Han Solo|sólo, Harry Potter|póter, Hermione|hermáioni, Gandalf|gándalf, Frodo|fródo, Shrek|shrék,
    Rocky|róqui, Rambo|rrámbo, Tony Montana|montána, Scarface|skéirfeis, Vito Corleone|corleóne, Walter White|guáit,
    Heisenberg|jáisenberg, Tony Soprano|sopráno, Tyler Durden|dérden, Neo|néo, Morpheo|morféo
  `);

  root.RIMAS_DATOS = D;
})(typeof window !== 'undefined' ? window : globalThis);
