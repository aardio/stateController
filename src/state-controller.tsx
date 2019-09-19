import React  from "react"

function create<P,R>( useValue: (props: P)=> R,displayName?:string ) {
	let Context = React.createContext<R|null>(null);
	const Provider: React.FC<P> = (p:React.PropsWithChildren<P>) =>  (<Context.Provider value={ useValue(p)  }>{p.children}</Context.Provider>);

	const useStateController = () => {
		let v = React.useContext(Context)
		if ( v ) { return v as R };  
		throw new Error(`Missing <${useStateController.displayName}.Provider>`)
	}

	useStateController.Provider = Provider;
	useStateController.displayName = displayName || "useStateController";
	return useStateController;
}

const combine = ( ...args:Array<{Provider:React.FunctionComponent}> ) :{Provider:React.FC<{}>} => ({
	Provider:(props:React.PropsWithChildren<{}>) =>  ( 
		<>{args.map( item=>item.Provider).reduceRight((prev, Next) => ( <Next>{ prev }</Next>), props.children) }</>
	)
});

function useIfMounted() {
	const [loading,setLoading] = React.useState(0);
	const refMounted = React.useRef(true);
	React.useEffect(() => () => {refMounted.current = false;},[]);

	function ifMounted() : boolean   
	function ifMounted<T>( v: (Promise<T> | (() => Promise<T>)) | T ) : Promise<T> 
	function ifMounted<T>( v?: (Promise<T> | (() => Promise<T>)) | T ) : boolean | Promise<T>  {
		if( v === undefined){
			return refMounted.current;
		}
		else{
			let p:Promise<T> = v as Promise<T>;
			if (typeof v === "function") {p = (v as any)();}
			if (!( p && (typeof p === "object") && "then" in p)) {p = Promise.resolve(p) as Promise<T>;}

			setLoading((prev:number)=>prev+1);
			return p.then(r => {
				// eslint-disable-next-line
				if(!refMounted.current) {throw null;}
				setLoading((prev:number)=>prev-1);
				return r;
			}).catch( e => {
				if(refMounted.current){ setLoading((prev:number)=>prev-1);}
				throw e;
			})
		}
	};

	return [React.useCallback(ifMounted,[]),!!loading] as [typeof ifMounted,boolean];
}

const stateController = {create,combine,useIfMounted}
export {stateController as default,create,combine,useIfMounted}
