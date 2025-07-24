export default function HomePage() {
  return (
    <div>
      {/* Page Header */}
      <div className="nk-block-head nk-block-head-sm">
        <div className="nk-block-between">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">Dashboard Overview</h3>
            <div className="nk-block-des text-soft">
              <p>Welcome to SliqInvoice Dashboard. Here's what's happening with your business today.</p>
            </div>
          </div>
          <div className="nk-block-head-content">
            <div className="toggle-wrap nk-block-tools-toggle">
              <a href="#" className="btn btn-icon btn-trigger toggle-expand mr-n1" data-target="pageMenu">
                <em className="icon ni ni-more-v"></em>
              </a>
              <div className="toggle-expand-content" data-content="pageMenu">
                <ul className="nk-block-tools g-3">
                  <li>
                    <div className="drodown">
                      <a href="#" className="dropdown-toggle btn btn-white btn-dim btn-outline-light" data-toggle="dropdown">
                        <em className="d-none d-sm-inline icon ni ni-calender-date"></em>
                        <span><span className="d-none d-md-inline">Last</span> 30 Days</span>
                        <em className="dd-indc icon ni ni-chevron-right"></em>
                      </a>
                    </div>
                  </li>
                  <li className="nk-block-tools-opt">
                    <a href="#" className="btn btn-primary">
                      <em className="icon ni ni-reports"></em>
                      <span>Reports</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="nk-block">
        <div className="row g-gs">
          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Total Invoices</h6>
                    </div>
                  </div>
                  <div className="data">
                    <div className="data-group">
                      <div className="amount">1,248</div>
                      <div className="nk-ecwg6-ck">
                        <canvas className="ecommerce-line-chart-s3" id="invoiceChart"></canvas>
                      </div>
                    </div>
                    <div className="info">
                      <span className="change up text-success">
                        <em className="icon ni ni-arrow-long-up"></em>4.63%
                      </span>
                      <span>vs. last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Total Revenue</h6>
                    </div>
                  </div>
                  <div className="data">
                    <div className="data-group">
                      <div className="amount">$45,230</div>
                      <div className="nk-ecwg6-ck">
                        <canvas className="ecommerce-line-chart-s3" id="revenueChart"></canvas>
                      </div>
                    </div>
                    <div className="info">
                      <span className="change up text-success">
                        <em className="icon ni ni-arrow-long-up"></em>12.5%
                      </span>
                      <span>vs. last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Active Customers</h6>
                    </div>
                  </div>
                  <div className="data">
                    <div className="data-group">
                      <div className="amount">356</div>
                      <div className="nk-ecwg6-ck">
                        <canvas className="ecommerce-line-chart-s3" id="customerChart"></canvas>
                      </div>
                    </div>
                    <div className="info">
                      <span className="change up text-success">
                        <em className="icon ni ni-arrow-long-up"></em>8.3%
                      </span>
                      <span>vs. last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-3 col-sm-6">
            <div className="card">
              <div className="nk-ecwg nk-ecwg6">
                <div className="card-inner">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Pending Invoices</h6>
                    </div>
                  </div>
                  <div className="data">
                    <div className="data-group">
                      <div className="amount">23</div>
                      <div className="nk-ecwg6-ck">
                        <canvas className="ecommerce-line-chart-s3" id="pendingChart"></canvas>
                      </div>
                    </div>
                    <div className="info">
                      <span className="change down text-danger">
                        <em className="icon ni ni-arrow-long-down"></em>2.1%
                      </span>
                      <span>vs. last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="nk-block">
        <div className="row g-gs">
          <div className="col-xxl-8">
            <div className="card card-bordered card-full">
              <div className="card-inner">
                <div className="card-title-group">
                  <div className="card-title">
                    <h6 className="title">Recent Invoice Activities</h6>
                  </div>
                  <div className="card-tools">
                    <a href="/invoices" className="link">View All</a>
                  </div>
                </div>
              </div>
              <div className="nk-tb-list">
                <div className="nk-tb-item nk-tb-head">
                  <div className="nk-tb-col"><span>Invoice</span></div>
                  <div className="nk-tb-col tb-col-sm"><span>Customer</span></div>
                  <div className="nk-tb-col"><span>Amount</span></div>
                  <div className="nk-tb-col"><span>Status</span></div>
                  <div className="nk-tb-col"><span>Date</span></div>
                </div>
                <div className="nk-tb-item">
                  <div className="nk-tb-col">
                    <span className="tb-lead">#INV-001249</span>
                  </div>
                  <div className="nk-tb-col tb-col-sm">
                    <span className="tb-sub">ABC Company</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub text-primary">$2,500.00</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="badge badge-dot badge-success">Paid</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub">23 Jan 2024</span>
                  </div>
                </div>
                <div className="nk-tb-item">
                  <div className="nk-tb-col">
                    <span className="tb-lead">#INV-001248</span>
                  </div>
                  <div className="nk-tb-col tb-col-sm">
                    <span className="tb-sub">XYZ Corp</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub text-primary">$1,800.00</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="badge badge-dot badge-warning">Pending</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub">22 Jan 2024</span>
                  </div>
                </div>
                <div className="nk-tb-item">
                  <div className="nk-tb-col">
                    <span className="tb-lead">#INV-001247</span>
                  </div>
                  <div className="nk-tb-col tb-col-sm">
                    <span className="tb-sub">John Smith Ltd</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub text-primary">$950.00</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="badge badge-dot badge-success">Paid</span>
                  </div>
                  <div className="nk-tb-col">
                    <span className="tb-sub">21 Jan 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xxl-4">
            <div className="card card-bordered card-full">
              <div className="card-inner">
                <div className="card-title-group">
                  <div className="card-title">
                    <h6 className="title">Quick Actions</h6>
                  </div>
                </div>
                <div className="nk-block">
                  <div className="row g-3">
                    <div className="col-sm-6 col-xxl-12">
                      <a href="/invoices/create" className="btn btn-primary btn-block">
                        <em className="icon ni ni-plus"></em>
                        <span>Create Invoice</span>
                      </a>
                    </div>
                    <div className="col-sm-6 col-xxl-12">
                      <a href="/customers/create" className="btn btn-outline-primary btn-block">
                        <em className="icon ni ni-user-add"></em>
                        <span>Add Customer</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}