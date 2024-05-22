declare namespace google {
    namespace maps {
        interface MapsLibrary {
            Map: any;
            Marker: any
        }
        interface MarkerLibrary {
            setMap(arg0: null): unknown;
            AdvancedMarkerElement: any;
        }
        function importLibrary(libraryName: string): Promise<MapsLibrary | MarkerLibrary>;
    }
}
