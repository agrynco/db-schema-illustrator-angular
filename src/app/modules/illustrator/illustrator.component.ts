import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {GojsAngularModule} from "gojs-angular";
import * as go from 'gojs';

@Component({
  selector: "illustrator",
  templateUrl: "illustrator.component.html",
  styleUrls: ["illustrator.component.scss"],
  standalone: true,
  imports: [
    GojsAngularModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class IllustratorComponent implements OnInit {
  @ViewChild('myDiagramDiv', {static: true}) myDiagramDiv!: ElementRef;

  colorSwitch(n: any) {
    const isDark = false;
    if (n === "green") return (isDark ? "#429E6F" : "#62bd8e");
    if (n === "blue") return (isDark ? "#3f9fc6" : "#3999bf");
    if (n === "purple") return (isDark ? "#9951c9" : "#7f36b0");
    if (n === "red") return (isDark ? "#ff4d3d" : "#c41000");
    return "black";
  }

  ngOnInit() {

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    let myDiagram =
      new go.Diagram("myDiagramDiv",   // must name or refer to the DIV HTML element
        {
          allowDelete: false,
          allowCopy: false,
          "undoManager.isEnabled": true
        });

    // the template for each attribute in a node's array of item data
    const itemTempl =
      $(go.Panel, "Horizontal",
        $(go.Shape,
          {
            desiredSize: new go.Size(15, 15),
            strokeJoin: "round",
            strokeWidth: 3,
            stroke: "#eeeeee",
            margin: 2
          },
          new go.Binding("figure", "figure"),
          new go.Binding("fill", "color", n => this.colorSwitch(n)),
          new go.Binding("stroke", "color", n => this.colorSwitch(n))
        ),
        $(go.TextBlock,
          {font: " 14px sans-serif", stroke: "black"},
          new go.Binding("text", "name"), new go.Binding("stroke", "", n => "#f5f5f5"),
        ));

    // define the Node template, representing an entity
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",  // the whole node panel
        {
          selectionAdorned: true,
          resizable: true,

          fromSpot: go.Spot.LeftRightSides,
          toSpot: go.Spot.LeftRightSides,
          isShadowed: true,
          shadowOffset: new go.Point(4, 4),
          shadowColor: "#919cab"
        },
        new go.Binding("location", "location").makeTwoWay(),
        // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
        // clear out any desiredSize set by the ResizingTool.
        new go.Binding("desiredSize", "visible", v => new go.Size(NaN, NaN)).ofObject("LIST"),
        // define the node's outer shape, which will surround the Table
        $(go.Shape, "RoundedRectangle",
          {stroke: "#e8f1ff", strokeWidth: 3},
          new go.Binding("fill", "", n => "#4a4a4a")
        ),
        $(go.Panel, "Table",
          {
            margin: 8,
            stretch: go.GraphObject.Fill,
            width: 160
          },
          $(go.RowColumnDefinition, {row: 0, sizing: go.RowColumnDefinition.None}),
          // the table header
          $(go.TextBlock,
            {
              row: 0, alignment: go.Spot.Center,
              margin: new go.Margin(0, 24, 0, 2),  // leave room for Button
              font: "bold 16px sans-serif"
            },
            new go.Binding("text", "key"),
            new go.Binding("stroke", "", n => "#d6d6d6")),
          // the collapse/expand button
          $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
            {row: 0, alignment: go.Spot.TopRight},
            new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
          $(go.Panel, "Table",
            {name: "LIST", row: 1, stretch: go.GraphObject.Horizontal},
            $(go.TextBlock,
              {
                font: "bold 15px sans-serif",
                text: "Attributes",
                row: 0,
                alignment: go.Spot.TopLeft,
                margin: new go.Margin(8, 0, 0, 0),
              },
              new go.Binding("stroke", "", n => "#d6d6d6")),
            $("PanelExpanderButton", "NonInherited", // the name of the element whose visibility this button toggles
              {
                row: 0,
                column: 1
              },
              new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
            $(go.Panel, "Vertical",
              {
                name: "NonInherited",
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
                row: 1
              },
              new go.Binding("itemArray", "items")),
            $(go.TextBlock,
              {
                font: "bold 15px sans-serif",
                text: "Inherited Attributes",
                row: 2,
                alignment: go.Spot.TopLeft,
                margin: new go.Margin(8, 0, 0, 0),
              },
              new go.Binding("visible", "visibility", Boolean),
              new go.Binding("stroke", "", n => "#d6d6d6")),
            $("PanelExpanderButton", "Inherited", // the name of the element whose visibility this button toggles
              {
                row: 2,
                column: 1,
              },
              new go.Binding("visible", "visibility", Boolean),
              new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
            $(go.Panel, "Vertical",
              {
                name: "Inherited",
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
                row: 3
              },
              new go.Binding("itemArray", "inheriteditems"))
          )
        ) // end Table Panel
      );  // end Node

    // define the Link template, representing a relationship
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
          selectionAdorned: true,
          layerName: "Background",
          reshapable: true,
          routing: go.Link.AvoidsNodes,
          corner: 5,
          curve: go.Link.JumpOver,
          isShadowed: true,
          shadowOffset: new go.Point(2, 2),
          shadowColor: "#919cab",
          click: (event: go.InputEvent, link: go.GraphObject) => {
            let clickedLink = link.part;
            if (clickedLink instanceof go.Link) {
              myDiagram.startTransaction('add text');
              // Clear the label for all Link Panels
              myDiagram.links.each((link) => {
                myDiagram.model.setDataProperty(link.data, 'text', '');
              });
              // Set the label for the Link Panel that was clicked
              myDiagram.model.setDataProperty(clickedLink.data, 'text', `Link goes from ${clickedLink.data.from} to ${clickedLink.data.to}`);
              myDiagram.commitTransaction('add text');
            }
          }
        },
        $(go.Shape,
          {
            stroke: "#f7f9fc",
            strokeWidth: 4
          }
        ),
        $(go.Panel, "Auto", {segmentIndex: 0},
          $(go.Shape, "RoundedRectangle", {fill: "#f7f9fc"}, {stroke: "#eeeeee"}),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "black",
              background: "#f7f9fc",
              segmentOffset: new go.Point(0, 0) //use zero as value for both x and y
            },
            new go.Binding("text", "text"))
        ),
        $(go.Panel, "Auto", {segmentIndex: -1},
          $(go.Shape, "RoundedRectangle", {fill: "#edf6fc"}, {stroke: "#eeeeee"}),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "black",
              segmentOffset: new go.Point(0, 0) //use zero as value for both x and y
            },
            new go.Binding("text", "toText"))
        )
      );

    // create the model for the E-R diagram
    const nodeDataArray = [
      {
        key: "My Entity", visibility: true, location: new go.Point(0, 0),
        items: [
          {name: "EntityID", iskey: true, figure: "Decision", color: "purple"},
          {name: "EntityName", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "EntityDescription", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "EntityIcon", iskey: false, figure: "TriangleUp", color: "red"}],
      },
      {
        key: "Products", visibility: true, location: new go.Point(250, 250),
        items: [{name: "ProductID", iskey: true, figure: "Decision", color: "purple"},
          {name: "ProductName", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "ItemDescription", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "WholesalePrice", iskey: false, figure: "Circle", color: "green",},
          {name: "ProductPhoto", iskey: false, figure: "TriangleUp", color: "red"}],
        inheriteditems: [{name: "SupplierID", iskey: false, figure: "Decision", color: "purple"},
          {name: "CategoryID", iskey: false, figure: "Decision", color: "purple"}]
      },
      {
        key: "Suppliers", visibility: false, location: new go.Point(600, 0),
        items: [{name: "SupplierID", iskey: true, figure: "Decision", color: "purple"},
          {name: "CompanyName", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "ContactName", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "Address", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "ShippingDistance", iskey: false, figure: "Circle", color: "green",},
          {name: "Logo", iskey: false, figure: "TriangleUp", color: "red"}],
        inheriteditems: []
      },
      {
        key: "Categories", visibility: true, location: new go.Point(250, 30),
        items: [{name: "CategoryID", iskey: true, figure: "Decision", color: "purple"},
          {name: "CategoryName", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "Description", iskey: false, figure: "Hexagon", color: "blue"},
          {name: "Icon", iskey: false, figure: "TriangleUp", color: "red"}],
        //inheriteditems: [{name: "SupplierID", iskey: false, figure: "Decision", color: "purple"}]
      },
      {
        key: "Order Details", visibility: true, location: new go.Point(600, 350),
        items: [{name: "OrderID", iskey: true, figure: "Decision", color: "purple"},
          {name: "UnitPrice", iskey: false, figure: "Circle", color: "green",},
          {name: "Quantity", iskey: false, figure: "Circle", color: "green",},
          {name: "Discount", iskey: false, figure: "Circle", color: "green"}],
        inheriteditems: [{name: "ProductID", iskey: true, figure: "Decision", color: "purple"}]
      },
    ];
    const linkDataArray = [
      {from: "Products", to: "Suppliers", text: "0..N", toText: "1"},
      {from: "Products", to: "Categories", text: "0..N", toText: "1"},
      {from: "Order Details", to: "Products", text: "0..N", toText: "1"},
      {from: "Categories", to: "Suppliers", text: "0..N", toText: "1"}
    ];
    myDiagram.model = new go.GraphLinksModel(
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        modelData: {darkMode: false},
        nodeDataArray: nodeDataArray,
        linkDataArray: linkDataArray
      });
  }
}
