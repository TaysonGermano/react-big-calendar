import React from "react";
import moment from 'moment'
import Scheduler, { SchedulerData, ViewTypes } from "react-big-scheduler";
import withDragDropContext from "./withDnDContext";

// utils
import { v4 as uuidv4 } from "uuid";

// component
import PageTitle from "../PageTitle";
import { Col, Row, Button, Alert, Spinner } from "react-bootstrap";
import CreateBookingModal from "../CreateBooking";
import EstablishmentsFilter from "./EstablishmentsFilter";
import SelectProperties from "../SelectProperties";

// style
import "react-big-scheduler/lib/css/style.css";

// modal
import Modal from "./BookingModal";

// images
import airbnb from "../../assets/images/booking-calendar/airbnb.png";
import bookingdotcom from "../../assets/images/booking-calendar/booking-com.png";
import booknow from "../../assets/images/booking-calendar/book-now.png";
import hostAgents from "../../assets/images/booking-calendar/hostagents.png";
import afristay from "../../assets/images/booking-calendar/afristay.png";
import expedia from "../../assets/images/booking-calendar/expedia.png";
import saVenues from "../../assets/images/booking-calendar/sa-venues.png";
import safariNow from "../../assets/images/booking-calendar/safari-now.png";
import travelGround from "../../assets/images/booking-calendar/travel-ground.png";
import ownerBookings from "../../assets/images/booking-calendar/default.png";
// context
import { BookingsContext } from "../../context/booking.context";

// skeleton data
import {skeletonResources} from './loaderObj'

interface ActiveProp {
  id: number,
  name: string;
}

class Basic extends React.Component<
  {},
  {
    viewModel: any;
    showModal: boolean;
    allData: any[];
    allproperties: any[];
    modalData: any;
    months: any;
    showFilter: any;
    range: number[];
    filter: any;
    errors: any;
    activeProperty: ActiveProp;
    disableFilter: boolean;
    loading: boolean;
  }
> {
  // context
  static contextType = BookingsContext;

  constructor(props: any) {
    super(props);
    let schedulerData = this.createScheduler(
      `${moment().year()}-${moment().month() + 1}-${moment().date()}`,
      skeletonResources,
      []
    );
    this.state = {
      viewModel: schedulerData,
      showModal: false,
      allData: [],
      allproperties: [],
      modalData: {},
      filter: {
        establishment_name: "",
        establishment_type: "",
        bathrooms: [],
        locations: [],
        bedrooms: [],
        features: [],
        priceRange: [],
      },
      range: [0, 100],
      months: {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      },
      showFilter: false,
      errors: {
        isError: false,
        errorMsg: "",
      },
      activeProperty: {
        id: 0,
        name: "",
      },
      disableFilter: false,
      loading: false,
    };
  }

  // display error if anything fails
  showError = (msg: string) => {
    this.setState({
      errors: { ...this.state.errors, isError: true, errorMsg: msg },
    });
  };

  // creates a new scheduler data
  createScheduler = (date: string, resources: any[], events: any[]) => {
    // setting the scheduler data
    let schedulerData = new SchedulerData(
      date,
      ViewTypes.Month,
      false,
      false,
      undefined,
      {
        getSummaryFunc: this.getSummary,
      }
    );
    schedulerData.setResources(resources);
    schedulerData.setEvents(events);

    return schedulerData;
  };

  // get today's date
  getToday: any = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  // get last day on the month
  lastday = (y: any, m: any) => {
    return new Date(y, m, 0).getDate();
  };

  // filter bookings based on selected month
  filterBookings = (date: string) => {
    // checking if month should be added a 0 before the actual month
    // to filter the booking for only that month on the API data
    const todayAr = date.split("-");
    const strDate: string =
      todayAr[1].length === 1
        ? `${todayAr[0]}-0${todayAr[1]}`
        : `${todayAr[0]}-${todayAr[1]}`;

    return strDate;
  };

  // display channel logo on tooltip
  displayLogo = (str: any) => {
    switch (str) {
      case "AirBnB":
        return airbnb;
      case "Booking.com":
        return bookingdotcom;
      case "Book Now":
        return booknow;
      case "AirAgents":
        return hostAgents;
      case "Afristay":
        return afristay;
      case "Owner":
        return ownerBookings;
      case "Travelground":
        return travelGround;
      case "SafariNow":
        return safariNow;
      case "Expedia":
        return expedia;
      case "SA Venues":
        return saVenues;
      default:
        return ownerBookings;
    }
  };

  // get bookings only
  getBookings = (
    schedulerData: any,
    allBookings: any[],
    dateToFilter: string
  ) => {
    // remove extra class to the table
    // document.querySelector(".scheduler")?.classList.remove("with-fixed-items");

    setTimeout(() => {
      const eventsOfTheMonth: any[] = [];

      for (const v of allBookings) {
        if (
          v.arrival_date.includes(this.filterBookings(dateToFilter)) &&
          v.status === 0
        )
          eventsOfTheMonth.push({
            id: v.id,
            start: v.arrival_date,
            end: v.departure_date,
            resourceId: v.property_id,
            title: (
              <div style={{ display: "flex", alignItems: "center" }}>
                {this.displayLogo(v.channel) && (
                  <img
                    src={this.displayLogo(v.channel)}
                    alt={v.channel}
                    style={{ marginRight: "5px", borderRadius: "50px" }}
                    className="channel-img"
                  />
                )}
                <span>{v.client_name}</span>
              </div>
            ),
            prop_name: v.prop_name,
            booking_ref: v.booking_ref,
            channel: v.channel,
            status: v.status,
            arrival: v.arrival_date,
            departure: v.departure_date,
            bgColor: v.status ? "#ffb35a" : "#ef3b5f",
          });
      }

      schedulerData.setEvents(eventsOfTheMonth);
      this.setState({
        viewModel: schedulerData,
      });
    }, 100);
  };

  getAllBookings = (
    schedulerData: any,
    allBookings: any[],
    dateToFilter: string
  ) => {
    setTimeout(() => {
      const eventsOfTheMonth: any[] = [];

      for (const v of allBookings) {
        if (
          v.arrival_date.includes(this.filterBookings(dateToFilter)) &&
          v.status === 0
        )
          eventsOfTheMonth.push({
            id: v.id,
            start: v.arrival_date,
            end: v.departure_date,
            resourceId: v.property_id,
            title: (
              <div style={{ display: "flex", alignItems: "center" }}>
                {this.displayLogo(v.channel) && (
                  <img
                    src={this.displayLogo(v.channel)}
                    alt={v.channel}
                    style={{ marginRight: "5px", borderRadius: "50px" }}
                    className="channel-img"
                  />
                )}
                <span>{v.client_name}</span>
              </div>
            ),
            prop_name: v.prop_name,
            booking_ref: v.booking_ref,
            channel: v.channel,
            status: v.status,
            arrival: v.arrival_date,
            departure: v.departure_date,
            bgColor:
              (!v.booking_ref && !v.channel && "#ffb35a") ||
              (v.booking_ref && !v.price && "#ef3b5f") ||
              (v.channel === "rates" && "transparent"),
            price: v.price || "",
          });
      }

      schedulerData.setEvents(eventsOfTheMonth);
      this.setState({
        viewModel: schedulerData,
      });

    

    }, 100);
  };

  // sorts array
  compare = (a: any, b: any) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  // fetch bookings and set resources
  getBookingsAndSetResources = (
    properties: any[],
    bookings: any[],
    fullDateToShow: string,
    getAllBookings: boolean
  ) => {
    try {
      // writting the resources for the calendar
      const resources: any[] = [];
      for (const v of properties) {
        resources.push({
          id: v.id,
          name: v.name,
        });
      }

      // envents variable
      const events: any[] = [];

      // creating new scheduler data
      const schedulerData = this.createScheduler(
        fullDateToShow,
        // sort the properties
        resources.sort(this.compare),
        events
      );

      this.setState({
        viewModel: schedulerData,
        // allData: bookings,
        // allproperties: properties,
      });

      // adding delay for the events to show
      if (getAllBookings) {
        this.getAllBookings(schedulerData, bookings, fullDateToShow);
      } else {
        this.getBookings(schedulerData, bookings, fullDateToShow);
      }
    } catch (err) {
      this.showError("Failed to fetch data");
      throw new Error(`Failed to fetch data ${err}`);
    }
  };

  // add vailalbility booking item
  addAvailability = (propertyData: any, id: number | null = 1, name: string | null = "") => {

    // gets all property info for rates and availabilty from nightsbridge and formats it
    let allProperties: any[] = [];

    for (let d of propertyData) {
      const { propid, avail } = d;
      if (Array.prototype.isPrototypeOf(avail)) {
        for (let v of avail) {
          allProperties.push({ ...v, propid });
        }
      }
    }

    // gets available dates
    let availability = allProperties.filter((d: any) => !d.noroomsfree);

    // // gets next month
    // const nextMonth = new Date(date);
    // nextMonth.setDate(nextMonth.getDate() + 1);

    // displays rates
    const rates: any[] = allProperties.map(
      (d: any, i: number, array: any[]) => {
        const nextDay = new Date(d.date);
        nextDay.setDate(nextDay.getDate() + 1);

        return {
          id: uuidv4(),
          arrival_date: d.date,
          departure_date: moment(nextDay).format("YYYY-MM-DD"),
          property_id: d.propid,
          client_name: "",
          prop_name: "",
          booking_ref: "",
          channel: "rates",
          status: 0,
          price: `R${d.roomrate}`,
        };
      }
    );

    function pushDate(
      year: number | string,
      month: number | string,
      isFirstday: boolean,
      day: number | string = "01"
    ) {
      if (isFirstday) {
        return `${year}-${+month + 1}-01`;
      } else {
        return `${year}-${month}-${+day + 1}`;
      }
    }

    // variables to hold start and end and price for each range
    const startDates: any[] = [];
    const endDates: any[] = [];
    // const prices: any[] = [];

    // get length of array
    const length = availability.length;

    // gets all the start and end dates
    availability.forEach((d: any, i: number, array: any[]) => {
      // gets each day of every availability date
      const day = +d.date.split("-")[2];
      // gets each year and month of every availability date
      const [year, month] = d.date.split("-");
      // gets next availability array element
      const next = +array[i + 1 < length ? i + 1 : i].date.split("-")[2];
      // gets previous availability array element
      const prev = +array[i - 1 < 0 ? 0 : i - 1].date.split("-")[2];

      // organize start and end dates for each range
      if (day + 1 === next && day - 1 !== prev) {
        startDates.push(d);
        // prices.push(d.roomrate);
      } else if (day + 1 !== next && day - 1 !== prev) {
        startDates.push(d);
        // prices.push(d.roomrate);
        if (day + 1 > +this.lastday(year, month)) {
          endDates.push({ ...d, date: pushDate(year, month, true) });
        } else {
           endDates.push({ ...d, date: pushDate(year, month, false, day) });
        }
      } else {
        if (day + 1 > +this.lastday(year, month)) {
           endDates.push({ ...d, date: pushDate(year, month, true) });
        } else if (day - 1 === prev && day + 1 !== next) {
          endDates.push({ ...d, date: pushDate(year, month, false, day) });
        }
      }
    });

    // changes availability to the correct data
    availability = startDates.map((d: any, i: number) => ({
      id: uuidv4(),
      arrival_date: d.date,
      // d.split("-")[1].length === 1
      //   ? `${d.split("-")[0]}-0${d.split("-")[1]}-${d.split("-")[2]}`
      //   : d,
      departure_date: endDates[i].date,
      property_id: d.propid,
      client_name: "",
      prop_name: "",
      booking_ref: "",
      channel: "",
      status: 0,
      price: `R${d.roomrate}`,
    }));

    return { availability, rates };
  };

  // filter properties
  getAvailabilityAndRates:any = async (
    id: number | string = "",
    name: string = "",
    customDate: string = ""
  ) => {
    try {
      this.setState({
        loading: true,
      });
      // gets calendar current date
      const nextBtn = document.querySelector(
        "i.anticon.anticon-right.icon-nav"
      );
      const previousDate =
        nextBtn?.parentElement?.children[1].textContent?.split(" ");

      // destructure the date that got from calendar
      const [getMonth, getYear] = previousDate ? previousDate : ["", ""];

      // find  which month number is the month from calendar
      let calMonth: number;

      // sets the month 
      calMonth = parseInt(this.state.months[getMonth.slice(0, 3)]);

      const currDate: any =
        calMonth === moment().month() + 1
          ? this.getToday()
          : `${getYear}-${calMonth}-01`;

      // destructure the year and month from date
      const [year, month] = currDate.split("-");

      //   // gets the base url from global context
      const { BASE_URL, API_KEY } = this.context;

      const response = await fetch(
        `${BASE_URL}/api/v2/bookings/nightsbridgebookingsall`,
        {
          method: "GET",
          headers: {
            Key: `${API_KEY}`,
            // Propid: `${132}`,
            Startdate: `${currDate}`,
            Enddate: `${year}-${month}-${this.lastday(year, month)}`,
          },
        }
      );

      // gets response status
      const { status } = response;

      // checks if staus is 200
      if (status === 200) {
        // gets data from API
        const data = await response.json();

        // tranforms the data form the calendar availability
        const { availability, rates } = this.addAvailability(data);

        // removes items with the same start date
        for (let d of this.state.allData) {
          for (let [i, v] of Object.entries(availability)) {
            if (
              v.arrival_date === d.arrival_date &&
              +v.property_id === +d.property_id
            ) {
              availability.splice(+i, 1);
            }
          }
        }

        // // combines the availabity items with the booking items
        // const availableAndBooked: any[] = [
        //   ...availability,
        //   ...rates,
        //   ...this.state.allData,
        // ];

        // this.getAllBookings(this.state.viewModel, availableAndBooked, currDate);

      } else {
        
      }

    } catch (err) {
      this.showError(
        "Could not fetch rates please try resfresh the page or contact your developer"
      );
      throw new Error(`${err}`);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  // get data from API
  getData = async () => {
    try {
      
      // this.getAvailabilityAndRates();
      // get base url
      const { BASE_URL, API_KEY } = this.context;
      // get the users id's
      const { id } = JSON.parse(sessionStorage.getItem("ubold_user")!);
      // getting the data
      const reponses = await Promise.all([
        fetch(`${BASE_URL}/api/v2/properties/${id}`, {
          headers: {
            Key: `${API_KEY}`,
          },
        }),
        fetch(`${BASE_URL}/api/v2/bookings`, {
          headers: {
            Key: `${API_KEY}`,
          },
        }),
      ]);

      // get user's details and set porperties on the global context
      const { getUsers, setAllProperties } = this.context;

      getUsers(+id);

      // storing the data
      const [properties, bookings] = [
        await reponses[0].json(),
        await reponses[1].json(),
      ];

      setAllProperties(properties);

      this.setState({
        allData: bookings,
        allproperties: properties,
      });

      const today = this.getToday();

      // set resorces and bookings
      this.getBookingsAndSetResources(properties, bookings, today, false);
    } catch (err) {
      this.showError("Failed to fetch data");
      throw new Error(`Failed to fetch data ${err}`);
    }
  };

  // close modal
  closeModal = () => this.setState({ showModal: false });

  prevClick = (schedulerData: any) => {
    try {
      schedulerData.prev();

      const prevBtn = document.querySelector("i.anticon.anticon-left.icon-nav");

      let currDate: any;

      const previousDate =
        prevBtn?.parentElement?.children[1].textContent?.split(" ");

      const [month, year] = previousDate ? previousDate : ["", ""];

      const prevMonth = parseInt(this.state.months[month.slice(0, 3)]) - 1;

      if (prevMonth === 0) {
        currDate = `${+year - 1}-12`;
      } else {
        currDate = `${year}-${
          prevMonth.toString().length === 1 ? `0${prevMonth}` : `${prevMonth}`
        }`;
      }

      schedulerData.setEvents([]);

      this.setState({
        viewModel: schedulerData,
      });

      if (this.state.activeProperty.id) {
        const { id, name } = this.state.activeProperty;
        this.filterProperties(id, name, "prev");
      } else {
        this.getBookings(schedulerData, this.state.allData, currDate);
      }
    } catch (err) {
      this.showError("Calendar failed to get date");
      throw new Error(`Calendar failed to get date ${err}`);
    }
  };

  nextClick = (schedulerData: any) => {
    try {
      schedulerData.next();
      const nextBtn = document.querySelector(
        "i.anticon.anticon-right.icon-nav"
      );

      let currDate: any;

      const previousDate =
        nextBtn?.parentElement?.children[1].textContent?.split(" ");

      const [month, year] = previousDate ? previousDate : ["", ""];

      const nextMonth = parseInt(this.state.months[month.slice(0, 3)]) + 1;

      if (nextMonth === 13) {
        currDate = `${+year + 1}-01`;
      } else {
        currDate = `${year}-${
          nextMonth.toString().length === 1 ? `0${nextMonth}` : `${nextMonth}`
        }`;
      }

      schedulerData.setEvents([]);

      this.setState({
        viewModel: schedulerData,
      });

      if (this.state.activeProperty.id) {
        const { id, name } = this.state.activeProperty;
        this.filterProperties(id, name, "next");
      } else {
        this.getBookings(schedulerData, this.state.allData, currDate);
      }
    } catch (err) {
      this.showError("Calendar failed to get date");
      throw new Error(`Calendar failed to get date ${err}`);
    }
  };

  onViewChange = (schedulerData: any, view: any) => {
    schedulerData.setEvents(this.state.viewModel.events);
    this.setState({
      viewModel: schedulerData,
    });
  };

  onSelectDate = (schedulerData: any, date: any) => {
    try {
      const [month, , year] = date._d.toString().split(" ").splice(1, 4);

      const dateString = `${year}-${this.state.months[month]}`;

      schedulerData.setDate(date);

      schedulerData.setEvents([]);

      this.setState({
        viewModel: schedulerData,
      });

      this.getBookings(schedulerData, this.state.allData, dateString);
    } catch (err) {
      this.showError("Calendar failed to get date");
      throw new Error(`Calendar failed to get date ${err}`);
    }
  };

  eventClicked = (schedulerData: any, event: any) => {
    try {
      this.setState({
        modalData: this.state.allData.find((d: any) => event.id === d.id),
        showModal: true,
      });
    } catch (err) {
      this.showError("Calendar failed to get this record from database");
      throw new Error(
        `Calendar failed to get this record from database ${err}`
      );
    }
  };

  // goes to current date
  goToToday: any = () => {
    const today = this.getToday();

    this.getBookingsAndSetResources(
      this.state.viewModel.resources,
      this.state.allData,
      today,
      false
    );
  };

  // tooltip customizer
  eventItemPopoverTemplateResolver = (
    schedulerData: any,
    eventItem: any,
    title: string,
    start: any,
    end: any,
    statusColor: any
  ) => {
    if (eventItem.booking_ref) {
      return (
        <div style={{ width: "310px" }}>
          <Row>
            <Col>
              <div className="key">
                <b>Property Name:</b>
              </div>
              <div className="key">
                <b>Guest Name:</b>
              </div>
              <div className="key">
                <b>Booking Reference:</b>
              </div>
              <div className="key">
                <b>Channel:</b>
              </div>
              <div className="key">
                <b>Status:</b>
              </div>
              <div className="key">
                <b>Arrival Date:</b>
              </div>
              <div className="key">
                <b>Departure Date:</b>
              </div>
            </Col>
            <Col className="calendar-tooltip">
              <div className="value">{eventItem.prop_name}</div>
              <div className="value">{eventItem.title}</div>
              <div className="value">{eventItem.booking_ref}</div>
              <div className="value">
                {this.displayLogo(eventItem.channel) && (
                  <img alt="AirBnb" src={this.displayLogo(eventItem.channel)} />
                )}
                {" " + eventItem.channel}
              </div>
              <div className="value">
                {eventItem.status ? (
                  <span className="bg-warning text-white rounded d-inline-block w-100 text-center">
                    Pending
                  </span>
                ) : (
                  <span
                    className="text-white rounded d-inline-block w-100 text-center"
                    style={{ backgroundColor: "#1abc9c" }}
                  >
                    Confirmed
                  </span>
                )}
              </div>
              <div className="value">{eventItem.arrival}</div>
              <div className="value">{eventItem.departure}</div>
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div style={{ width: "310px" }}>
          <Row>
            <Col>
              {/* <div className="key">
                <b>Property Name:</b>
              </div> */}
              <div className="key">
                <b>Start Date:</b>
              </div>
              <div className="key">
                <b>End Date:</b>
              </div>
            </Col>
            <Col className="calendar-tooltip">
              {/* <div className="value">{eventItem.prop_name}</div> */}
              <div className="value">{eventItem.arrival}</div>
              <div className="value">{eventItem.departure}</div>
            </Col>
          </Row>
        </div>
      );
    }
  };

  // displays the price on the cells
  getSummary = (
    schedulerData: any,
    headerEvents: any,
    slotId: any,
    slotName: any,
    headerStart: any,
    headerEnd: any
  ) => {
    const price = headerEvents[0]?.price;
    let text = price || "";
    let color = "#6c757d";
    return { text: text, color: color, fontSize: "11px" };
  };

  // closeFilter
  closeFilter = () => this.setState({ showFilter: false });

  // range change handler
  handleRangeChange = (e: Event, newValue: number | number[]) => {
    this.setState({ range: newValue as number[] });
  };

  // save filter choices
  saveFiltering = (data: any) => {
    // saves all selected locations
    const locations = data.suburb_name.map((d: any) => d.value);

    // saves all selected rooms
    const rooms = data.bedroom_num.map((d: any) => d.value);

    // saves all selected bathrooms
    const bathrooms = data.bathroom_num.map((d: any) => d.value);

    // save the filtered properties
    const filteredProperties = this.state.allproperties.filter(
      (d: any) =>
        locations.includes(d.suburb_name) &&
        rooms.includes(d.bedroom_num) &&
        bathrooms.includes(d.bathroom_num) && {
          ...d,
        }
    );

    this.getBookingsAndSetResources(
      filteredProperties,
      this.state.allData,
      this.getToday(),
      false
    );
  };

  // reset filtering
  resetFiltering = () => {
    // resets the calendar
    this.getBookingsAndSetResources(
      this.state.allproperties,
      this.state.allData,
      this.getToday(),
      false
    );

    // hides the filter
    this.setState({ showFilter: false });
  };

  // highlight today and formats the days cells title
  nonAgendaCellHeaderTemplateResolver = (
    schedulerData: any,
    item: any,
    formattedDateItems: any,
    style: any
  ) => {
    let datetime = schedulerData.localeMoment(item.time);
    let isCurrentDate = false;

    if (schedulerData.viewType === ViewTypes.Day) {
      isCurrentDate = datetime.isSame(new Date(), "hour");
    } else {
      isCurrentDate = datetime.isSame(new Date(), "day");
    }

    if (isCurrentDate) {
      style.backgroundColor = "#1abc9c";
      style.color = "white";
    }

    return (
      <th key={item.time} className={`header3-text`} style={style}>
        {formattedDateItems.map((formattedItem: any, index: number) => {
          const [day, monthDate] = formattedItem.split(" ");
          return (
            <div
              key={index}
              //     dangerouslySetInnerHTML={{
              //       __html: formattedItem.replace(/[0-9]/g, "<b>$&</b>"),
              //     }}
              dangerouslySetInnerHTML={{
                __html: `${day} ${monthDate.slice(monthDate.indexOf("/") + 1)}`,
              }}
            />
          );
        })}
      </th>
    );
  };

  // filter properties
  filterProperties = async (
    id: number | string = "",
    name: string = "",
    customDate: string = ""
  ) => {
    try {
      this.setState({
        loading: true,
      });
      // gets calendar current date
      const nextBtn = document.querySelector(
        "i.anticon.anticon-right.icon-nav"
      );
      const previousDate =
        nextBtn?.parentElement?.children[1].textContent?.split(" ");

      // destructure the date that got from calendar
      const [getMonth, getYear] = previousDate ? previousDate : ["", ""];

      // find  which month number is the month from calendar
      let calMonth: number;

      switch (customDate) {
        case "prev":
          calMonth = parseInt(this.state.months[getMonth.slice(0, 3)]) - 1;
          break;
        case "next":
          calMonth = parseInt(this.state.months[getMonth.slice(0, 3)]) + 1;
          break;
        default:
          calMonth = parseInt(this.state.months[getMonth.slice(0, 3)]);
      }

      const currDate: any =
        calMonth === moment().month() + 1
          ? this.getToday()
          : `${getYear}-${calMonth}-01`;

      // destructure the year and month from date
      const [year, month] = currDate.split("-");

      if (typeof id === "number") {
        // gets the base url from global context
      const { BASE_URL, API_KEY } = this.context;

      // makes API call
      const response = await fetch(
        `${BASE_URL}/api/v2/bookings/nightsbridgebookings`,
        {
          method: "GET",
          headers: {
            Key: `${API_KEY}`,
            Propid: `${id}`,
            Startdate: `${currDate}`,
            Enddate: `${year}-${month}-${this.lastday(year, month)}`,
          },
        }
      );

        // gets response status
        const { status } = response;

        // checks if staus is 200
        if (status === 200) {
          // gets data from API
          const data = await response.json();
          // tranforms the data form the calendar availability
          const {availability, rates} = this.addAvailability(data, +id, name);

          // removes items with the same start date
          for (let d of this.state.allData) {
            for (let [i, v] of Object.entries(availability)) {
              if (
                v.arrival_date === d.arrival_date &&
                v.property_id === d.property_id
              ) {
                availability.splice(+i, 1);
              }
            }
          }

          const filteredProp: any[] = [];
          filteredProp.push(
            this.state.allproperties.find((d: any) => d.id === id && { ...d })
          );

          // combines the availabity items with the booking items
          const availableAndBooked: any[] = [
            ...availability,
            ...rates,
            ...this.state.allData,
          ];

          // set the active property state
          this.setState({
            activeProperty: {
              id: +id,
              name: name,
            },
            disableFilter: true,
          })

          // display result of the filtering on calendar
          this.getBookingsAndSetResources(
            filteredProp,
            availableAndBooked,
            currDate,
            true
          );
        } else {
          // filters the property
          const filteredProp: any[] = [];
          filteredProp.push(
            this.state.allproperties.find((d: any) => d.id === id && { ...d })
          );

          // display result of the filtering on calendar
          this.getBookingsAndSetResources(
            filteredProp,
            this.state.allData,
            currDate,
            false
          );
        }
      } else {

        // enable filter button and remove active property
         this.setState({
           activeProperty: {
             id: 0,
             name: "",
           },
           disableFilter: false,
         });

         // set all properties to the calendar
        this.getBookingsAndSetResources(
          this.state.allproperties,
          this.state.allData,
          currDate,
          false
        );
      }
    } catch (err) {
      this.showError(
        "Couldn't filter the selected property. Please try again or contact your developer"
      );
      throw new Error(`${err}`);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  componentDidMount() {
    // API Calls
    this.getData();
  }

  render() {
    const { viewModel, errors } = this.state;
    const { groupId } = JSON.parse(sessionStorage.getItem("ubold_user")!);
    return (
      <section className="bk-calendar">
        <Row>
          <Col>
            <PageTitle title="Calendar" />
          </Col>
          <Col
            xs={8}
            md={6}
            className="d-flex align-items-center justify-content-end"
          >
           <CreateBookingModal/>
          </Col>
        </Row>
        {errors.isError ? (
          <Alert variant="danger">{errors.errorMsg}</Alert>
        ) : (
          <React.Fragment>
            <Row className="justify-content-between">
              <Col className="flex-row d-flex align-items-center">
                <Button className="btn-white today" onClick={this.goToToday}>
                  Today
                </Button>
                {/* <Button className="btn-white">
                  <i className="fe-refresh-cw"></i>Reset
                </Button> */}
                {this.state.loading && (
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ marginLeft: "10px" }}
                  />
                )}
              </Col>
              <Col
                xs="8"
                md="6"
                className="flex-row d-flex justify-content-end"
              >
                <Button
                  className="btn-white"
                  onClick={() => this.setState({ showFilter: true })}
                  disabled={this.state.disableFilter}
                >
                  <i className="fas fa-filter"></i> Filter
                </Button>
                <SelectProperties seletedProperty={this.filterProperties} />
              </Col>
            </Row>
            {this.state.showFilter && (
              <EstablishmentsFilter
                showFilter={this.state.showFilter}
                closeFilter={this.closeFilter}
                saveFiltering={this.saveFiltering}
                resetFiltering={this.resetFiltering}
                range={[0, 100]}
              />
            )}
            {this.state.showModal && +groupId !== 1 && (
              <Modal
                showModal={this.state.showModal}
                onClose={this.closeModal}
                data={this.state.modalData}
                properties={this.state.allData}
              />
            )}
            <Scheduler
              schedulerData={viewModel}
              prevClick={this.prevClick}
              nextClick={this.nextClick}
              onSelectDate={this.onSelectDate}
              onViewChange={this.onViewChange}
              eventItemClick={this.eventClicked}
              eventItemPopoverTemplateResolver={
                this.eventItemPopoverTemplateResolver
              }
              nonAgendaCellHeaderTemplateResolver={
                this.nonAgendaCellHeaderTemplateResolver
              }
            />
            <Row>
              <Col className="flex-row d-flex">
                <div className="indicators">
                  <span className="indicator indicator-primary"></span>Booked
                </div>
                <div className="indicators">
                  <span className="indicator indicator-secondary"></span>
                  Provisionally Booked
                </div>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </section>
    );
  }
}

export default withDragDropContext(Basic);
