import React, { Component } from 'react';
import './App.css';

class MenuItem extends Component {
    constructor(props) {
	super(props);
	this.state = {};
    }

    handleClick(layer) {
	this.setState({ layer: layer});
	console.log(this.state)
    }
	
    render() {
	return <div>
	    <li style={{color:"black", fontWeight: "bold"}}> {this.props.item.category}</li>
	           <ul id="itemMenu">
	               {this.props.item.subcategories.map(s =>
			<a onClick={() => this.handleClick(s)}><li>{s.label}</li></a>
			)}
                   </ul>
	        </div>
    };
}

class Menu extends Component {
    constructor(props) {
	super(props);
	this.state = {};
    }

    
    render() {
	return <nav role="navigation">
	           <div id="menuToggle">
	               <input type="checkbox" />
	               <span></span>
                       <span></span>
	               <span></span>
	               <ul id="menu">
	                   {this.props.menu.map(m =>
				 <MenuItem item={m} />)} 
	               </ul>
	            </div>
	        </nav>

  };
}

export default Menu;
	    
