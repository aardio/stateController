import React from "react"

function create<D,C,P>( useStore: (props: P)=> readonly [D,C],displayName?:string ) {
	let Context = React.createContext< ( readonly [D,C] ) | null>(null);
	const Provider: React.FC<P> = p =>  (<Context.Provider value={ useStore(p)  }>{p.children}</Context.Provider>);

	const useStateController = () => {
		let v = React.useContext(Context)
		if ( Array.isArray(v) && v.length === 2 ) { return v as [typeof v[0],typeof v[1]] };  
		throw new Error(`Missing <${useStateController.displayName}.Provider>`)
	}

	useStateController.Provider = Provider;
	useStateController.displayName = displayName || "useStateController";
	return useStateController;
}


const combine = ( ...args:Array<{Provider:React.FunctionComponent}> ) :{Provider:React.FC<{}>} => ({
	Provider:(props) =>  ( 
		<>{args.map( item=>item.Provider).reduceRight((prev, Next) => ( <Next>{ prev }</Next>), props.children) }</>
	)
});

export default {create,combine}