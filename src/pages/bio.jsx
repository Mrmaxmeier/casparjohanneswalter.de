import React from 'react'

export class BioPage extends React.Component {
  render () {
    // TODO: bio pic
    return (
      <section className="bio">
        <img src={require('../../static/index.jpg')} />
        <p>
          He was born in Frankfurt/Main in 1964, and studied composition with V. D. Kirchner (Wiesbaden) as well as with J. Fritsch and C. Barlow (Cologne Conservatory of Music, 1985-90). In 1985 he was cofounder of the Cologne-based Thürmchen Verlag (Publishing House). He has received several major composition awards including the first prize in the Stuttgart Composition Competition (1991), the 13th Irino Prize for Orchestra (Japan, 1992), in 1995 the first prize in the competition »Vienna modern«, the Hindemith Award of the Schleswig-Holstein Festival and from the state of North Rhine-Westphalia the award for most promising in the category music. In 1988, he was awarded the same by the City of Cologne. He received a scholarship in 1995/96 at the Künstlerhof Schreyahn (Artists' Colony), Lower Saxony, and in 1998 he has been granted a fellowship to carry out his work at the Villa Massimo in Rome. He has represented the young generation of Cologne musicians in exchange projects sponsored by the Goethe Institute in New York (1989) and Atlanta (1993). His pieces were selected for the World Music Days in Stockholm in 1994 and in Copenhagen in 1996. A CD with chamber music works by Caspar Johannes Walter released by the German Council of Music on the Label Wergo has been awarded the »Preis der deutschen Schallplattenkritik« in 1998.
        </p>
        <p>
          His interests as an interpreter - he is cellist in the Thürmchen Ensemble, which he also co-founded in 1991 - are focused primarily on young composers from the areas of experimental music and musical theatre. Caspar Johannes Walter's works are performed regularly, not only in Europe but also very successfully in the USA and Japan, for example 1993 World Premieres in Atlanta and Tokyo.
        </p>
        <p>
          In 2002/2003 Caspar Johannes Walter was teacher of composition and composer in Residence at the University of Birmingham/UK, since 2006 he was professor for composition and director of the studio contemporary music in Stuttgart/Germany and since since 2013 he is professor for composition at the Musikakademie Basel/Switzerland. In 2014 he was elected into the „Akademie der Künste, Berlin“.
        </p>
      </section>
    )
  }
}
