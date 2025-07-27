module.exports = {
    async rewrites(){
        return[
            {
             source: '/manager/customer',
             destination: '/dashboard/customer',
           },
            {
             source: '/manager/users',
             destination: '/dashboard/users',
           },
            {
             source: '/manager/modules',
             destination: '/dashboard/modules',
           },
            {
             source: '/manager',
             destination: '/dashboard',
           }
    ]
    }   
}