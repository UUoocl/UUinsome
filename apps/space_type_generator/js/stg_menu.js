const stgMenuDiv = document.createElement('div');
stgMenuDiv.id = 'stg_menu';
stgMenuDiv.innerHTML = `
    <div class="dropdown">
      <button class="dropbtn">Select...</button>
      <div class="dropdown-content">
        <a href="./cylinder.html" >CYLINDER</a>
        <!-- <a href="./field.html" >FIELD</a> -->
        <a href="./stripes.html" >STRIPES</a>
        <!-- <a href="./coil.html" >COIL</a>
        <a href="./flag.html" >FLAG</a>
        <a href="./morisawa.html" >MORISAWA</a>
        <a href="./cascade.html" >CASCADE</a>
        <a href="./ribbon.html" >RIBBON</a> -->
        <a href="./layers.html" >LAYERS</a>
        <a href="./danger.html" >DANGER</a>
        <!-- <a href="./string.html" >STRING</a>
        <a href="./badge.html" >BADGE</a>
        <a href="./clutter.html" >CLUTTER</a>
        <a href="./construct.html" >CONSTRUCT</a>
        <a href="./snap.html" >SNAP</a>
        <a href="./flash.html" >FLASH</a>
        <a href="./pow.html" >POW</a>
        <a href="./crash.html" >CRASH</a>
        <a href="./crashclock.html" >CRASH CLOCK</a>
        <a href="./vessel.html" >VESSEL</a>
        <a href="./shine.html" >SHINE</a> -->
        <a href="./boost.html" >BOOST</a>
      </div>
    </div>
    `;

// 2. Prepend the new element to the body
document.body.append(stgMenuDiv);