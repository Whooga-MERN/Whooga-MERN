import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Zdog from "zdog";
// On the Logged out page
export default function Navbar() {
  const [isClick, setisClick] = useState(false);

  const toggleNav = (): void => {
    setisClick(!isClick);
  };

  // function classNames(...classes: string[]) {
  //   return classes.filter(Boolean).join(" ");
  // }


    useEffect(() => { 

      var illoElem = document.querySelector('.illo');
      var sceneSize = 96;
      var TAU = Zdog.TAU;
      var ROOT3 = Math.sqrt(3);
      var ROOT5 = Math.sqrt(5);
      var PHI = ( 1 + ROOT5 ) / 2;
      var isSpinning = true;
      var viewRotation = new Zdog.Vector();
      var displaySize;

      // colors
      var eggplant = '#636';
      var garnet = '#C25';
      var orange = '#E62';
      var gold = '#EA0';
      var yellow = '#ED0';

      // var eggplant = '#4B4B4B'; // Dark Gray
      // var garnet = '#A9A9A9';   // Gray
      // var orange = '#E62';
      // var gold = '#EA0';
      // var yellow = '#ED0';

      // var eggplant = '#000000'; // Black
      // var garnet = '#808080';   // Gray
      // var orange = '#E62';
      // var gold = '#EA0';
      // var yellow = '#ED0';


      var illo = new Zdog.Illustration({
        element: illoElem,
        scale: 8,
        resize: 'fullscreen',
        onResize: function( width, height ) {
          displaySize = Math.min( width, height );
          this.zoom = Math.floor( displaySize / sceneSize );
        },
      });

      var solids: Zdog.Anchor[] = [];
    (function() {

      var octahedron = new Zdog.Anchor({
        addTo: illo,
        translate: { x: -4, y: 4 },
        scale: 1.75,
      });

      solids.push( octahedron );

      var colorWheel = [ eggplant, garnet, orange, gold, yellow ];

      // radius of triangle with side length = 1
      var radius = ROOT3/2 * 2/3;
      var height = radius * 3/2;
      var tilt = Math.asin( 0.5 / height );

      [ -1, 1 ].forEach( function( ySide ) {
        for ( var i=0; i < 4; i++ ) {
          var rotor = new Zdog.Anchor({
            addTo: octahedron,
            rotate: { y: TAU/4 * (i + 1.5) * -1 },
          });

          var anchor = new Zdog.Anchor({
            addTo: rotor,
            translate: { z: 0.5 },
            rotate: { x: tilt * ySide },
            // scale: { y: -ySide },
          });

          new Zdog.Polygon({
            sides: 3,
            radius: radius,
            addTo: anchor,
            translate: { y: -radius/2 * ySide },
            scale: { y: ySide },
            stroke: false,
            fill: true,
            color: colorWheel[ i + 0.5 + 0.5*ySide ],
            backface: false,
          });
        }
      });


    })();

    var keyframes = [
      { x:   0, y:   0 },
      { x:   0, y: TAU },
      { x: TAU, y: TAU },
    ];
    
    var ticker = 0;
    var cycleCount = 180;
    var turnLimit = keyframes.length - 1;
    var maxTicks = 1 * cycleCount * turnLimit; // 2 full spins
    
    function animate() {
      if (ticker < maxTicks) { // Stop after 2 spins
        update();
        illo.renderGraph();
        requestAnimationFrame(animate);
      }
    }
    
    animate();
    
    function update() {
    
      if ( isSpinning ) {
        var progress = ticker / cycleCount;
        var tween = Zdog.easeInOut( progress % 1, 4 );
        var turn = Math.floor( progress % turnLimit );
        var keyA = keyframes[ turn ];
        var keyB = keyframes[ turn + 1 ];
        viewRotation.x = Zdog.lerp( keyA.x, keyB.x, tween );
        viewRotation.y = Zdog.lerp( keyA.y, keyB.y, tween );
        ticker++;
      }
    
      solids.forEach( function( solid ) {
        solid.rotate.set( viewRotation );
      });
    
      illo.updateGraph();
    }
    

  }, [])

    

  return (
    <div>
      {" "}
      {/* navbar */}
      <nav className="bg-primary opacity-80 dark:bg-primary">
        {/* <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8"> */}
        <div className="px-8">
          <div className="flex items-center h-16 justify-between">
            <div className="flex flex-box justify-center items-center">
              {/* <div className="flex-shrink-0"> */}
                <Link to="/" className="text-black font-bold text-4xl">
                  WHOOGA! 
                </Link>
                <canvas className="illo h-48 mt-[-125px] ml-[-55px]"></canvas>
              {/* </div> */}
            </div>

            {/* menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                <Link
                  to="/auth"
                  className="text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  className="text-black bg-white hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* responsive navbar */}
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 pr-8 rounded-md text-black
                              hover:text-orange-400 focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleNav}
              >
                {isClick ? (
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        {isClick && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/auth"
                className="block text-black hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="block text-black bg-white hover:bg-yellow-300 hover:text-orange-400 rounded-lg p-2 font-bold"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* navbar end */}
    </div>
  );
}
