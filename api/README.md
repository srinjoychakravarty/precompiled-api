# Contract API Doc.

Contract api is implemented based on Polkadot JS API version ```1.22.0-beta.5```. It allows to interact with our rust-based ink! contracts via Javscript. 

## API Types
* Role contract (role_contract.js)
* Account contract (account_contract.js)
* Register SST contract (regtrSST_contract.js)
* Core contract (core_contract.js)

## Role Contract API
Generally, role contract api shouldn't be called directly, most of the time it'll be called from core contract, unless you want to set an account as ```System type```. 

### **call_addRoleType(addr, value)** </br >
Set account type by account address and type value. </br >

Return a ```Promise``` type of object as result.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* value: account type value, an ```integer``` type value like 1 (System type)

```javascript
async function sample() {
    let resultObj = await call_addRoleType("5FE43cBHUf7yzu7ahkAKnEpbg59xndM5PCwLaoe6GodQjsqd", 1);

    console.log(resultObj);
}
```

### **call_getRoleType(addr)** </br >
Get account type by account address. </br >

Return a ```Promise``` type of object as result.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let resultObj = await call_getRoleType("5FE43cBHUf7yzu7ahkAKnEpbg59xndM5PCwLaoe6GodQjsqd");

    console.log(resultObj);
}
```

### **call_addRole(addr, func_name, permission)** </br >
Set account role by address, role function name & permission. Each account can only have one role. 

Return an ```Object``` type result contains function name & permission value.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
* permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
async function sample() {
    let resultObj = call_addRole("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ", 2002, 1);

    console.log(resultObj);
    // output: { func_name: 2002, permission: 1 }
}
```

### **call_getRole(addr)** </br >
Get account role by address. </br >

Return an ```Object``` type result contains function name.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let resultObj = call_getRole("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

    console.log(resultObj);
    // output: { func_name: 2002 }
}
```

### **call_removeRole(addr)** </br >
Remove account role by address. </br >

Return an ```Object``` type result contains function name.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let resultObj = call_removeRole("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

    console.log(resultObj);
    // output: { func_name: 2002 }
}
```

### **call_hasRole(addr)** </br >
Check if an account has a role by address. </br >

Return an ```Object``` type result contains permission value.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let resultObj = call_hasRole("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

    console.log(resultObj);
    // output: { permission: 0 }
}
```

### **call_addApprover(addr, func_name, stage)** </br >
Set an approver by address, function name and stage of approval process. </br >

Return an ```Object``` type result contains function name & stage value.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
* stage: stage of approval process, an ```integer``` type value like 1 (stage 1). There are 3 stages of approval process in current demo: 0, 1, 2

```javascript
async function sample() {
    let resultObj = call_addApprover("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ", 2002, 1);

    console.log(resultObj);
    // output: { func_name: 2002, stage: 1 }
}
```

### **call_isApprover(addr, func_name, stage)** </br >
Check if an account has specific role function permission in specific stage by address, function name and stage. </br >

Return an ```Object``` type result contains permission value. If return 1 as value, the account has role permission; return 0, it doesn't have permission.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
* stage: stage of approval process, an ```integer``` type value like 1 (stage 1). There are 3 stages of approval process in current demo: 0, 1, 2

```javascript
async function sample() {
    let resultObj = call_isApprover("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ", 2002, 1);

    console.log(resultObj);
    // output: { permission: 1 }
}
```

### **call_addParent(addr, parentAddr)** </br >
Set an account as parent account when it grants another account as an approver. </br >

Return an ```Object``` type result contains parent address. 

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* parentAddr: parent account address, it's the granter for an approver, an ```string``` type value like "5C61uSppDAB6oYmD4UQw1mcjftLsH8BbdnLiekCtnjHy2ZDH

```javascript
async function sample() {
    let resultObj = call_addParent("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ", "5C61uSppDAB6oYmD4UQw1mcjftLsH8BbdnLiekCtnjHy2ZDH");

    console.log(resultObj);
    // output: { parent_address: '5C61uSppDAB6oYmD4UQw1mcjftLsH8BbdnLiekCtnjHy2ZDH' }
}
```

### **call_getParent(addr)** </br >
Get parent account address by approver's address. </br >

Return an ```Object``` type result contains parent address. 

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let resultObj = call_getParent("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

    console.log(resultObj);
    // output: { parent_address: '5C61uSppDAB6oYmD4UQw1mcjftLsH8BbdnLiekCtnjHy2ZDH' }
}
```

### **call_getBalance()** </br >
Get the balance of the executed contract. </br >

Return an ```Object``` type result contains contract balance. 

```javascript
async function sample() {
    let resultObj = call_getBalance();

    console.log(resultObj);
    // output: { balance: 100000000000000000 }
}
```

## Account Contract API
Account contract is a delegated contract for role contract. We'll mainly use account contract api to add/ manage role or type for accounts. 

### **call_grantAccountType(objArr)** </br >
Set account type for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains caller, register_account & register_type.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// func_name and permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
            type: 2,
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
            type: 2,
        }
    ]

async function sample() {
    let resultObj = await call_grantAccountType(roleObjs);

    console.log(resultObj);
    /* output: [
        {
            caller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            register_account: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            register_type: 2
        },
        {
            caller: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            register_account: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            register_type: 2
        }
    ]
    */
}
```

### **call_getAccountType(objArr)** </br >
Get account type for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address & type values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type, func_name and permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
        }
    ]

async function sample() {
    let resultObj = await call_getAccountType(roleObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            roleType: 2
        },
        {
            address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            roleType: 2
        }
    ]
    */
}
```

### **call_grantAddressRole(objArr)** </br >
Set account role for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains func_name & permission values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
            func_name: 2002,
            permission: 1
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
            func_name: 2006,
            permission: 1
        }
    ]

async function sample() {
    let resultObj = await call_grantAddressRole(roleObjs);

    console.log(resultObj);
    /* output: [
        { func_name: 2002, permission: 1 },
        { func_name: 2006, permission: 1 } 
    ]
    */
}
```

### **call_getAccountRole(objArr)** </br >
Get account role for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains func_name & permission values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type, func_name, permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
        }
    ]

async function sample() {
    let resultObj = await call_getAccountRole(roleObjs);

    console.log(resultObj);
    /* output: [
        { func_name: 2002, permission: 1 },
        { func_name: 2006, permission: 1 } 
    ]
    */
}
```

### **call_removeAddressRole(objArr)** </br >
Remove account role for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address & func_name values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type, func_name, permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
        }
    ]

async function sample() {
    let resultObj = await call_removeAddressRole(roleObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            func_name: 2002
        },
        {
            address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            func_name: 2006
        }
    ]
    */
}
```

### **call_removeAddressRole(objArr)** </br >
Remove account role for a series accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address & func_name values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type, func_name, permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
        }
    ]

async function sample() {
    let resultObj = await call_removeAddressRole(roleObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            func_name: 2002
        },
        {
            address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            func_name: 2006
        }
    ]
    */
}
```

### **call_doesAccountHaveRole(objArr)** </br >
Check if a series of accounts have roles by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address & hasRole (boolean) values.

* objArr: An array of objects which contains account type and role info. Each object have 4 attributes: addr, type, func_name, permission. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * type: account type value, an ```integer``` type value like 2 (GWAL type)
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * permission: has permission or not, generally set as 1 to indicate this account has this role permission

```javascript
// type, func_name, permission is optional in this example
let roleObjs = 
    [   
        {
            addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //ALICE
        },
        {
            addr: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', //CHARLIE
        }
    ]

async function sample() {
    let resultObj = await call_doesAccountHaveRole(roleObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            hasRole: false
        },
        {
            address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            hasRole: false
        }
    ]
    */
}
```

### **call_registerRoleApprovalAddress(objArr)** </br >
Register a series of accounts as approvers for different stages by an array of objects. </br >

Return a ```Promise``` type of object as result, contains func_name & stage values.

* objArr: An array of objects which contains account type and role info. Each object have 3 attributes: addr, func_name, stage. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * stage: stage of approval process, an ```integer``` type value like 1 (stage 1). There are 3 stages of approval process in current demo: 0, 1, 2

```javascript
let approverObjs = 
    [
        {
            addr: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', //EVE
            func_name: 2008,
            stage: 0,
        },
        {
            addr: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL', //FERDIE
            func_name: 2009,
            stage: 1,
        },
        {
            addr: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', //DAVE
            func_name: 2010,
            stage: 2,
        }
    ];

async function sample() {
    let resultObj = await call_registerRoleApprovalAddress(approverObjs);

    console.log(resultObj);
    /* output: [
        { func_name: 2008, stage: 0 },
        { func_name: 2009, stage: 1 },
        { func_name: 2010, stage: 2 }
    ]
    */
}
```

### **call_isApprovalAddress(objArr)** </br >
Check if a series of accounts are registered as approvers by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address, func_name, stage & isApprover values.

* objArr: An array of objects which contains account type and role info. Each object have 3 attributes: addr, func_name, stage. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * func_name: role function name, an ```integer``` type value like 2002 (holdingGWAL), check out the list of function name in [here](https://github.com/prometheumlabs/substrate-playground/blob/beta/contracts-api/CONTRACT-API.md#role)
    * stage: stage of approval process, an ```integer``` type value like 1 (stage 1). There are 3 stages of approval process in current demo: 0, 1, 2

```javascript
let approverObjs = 
    [
        {
            addr: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', //EVE
            func_name: 2008,
            stage: 0,
        },
        {
            addr: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL', //FERDIE
            func_name: 2009,
            stage: 1,
        },
        {
            addr: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', //DAVE
            func_name: 2010,
            stage: 2,
        }
    ];

async function sample() {
    let resultObj = await call_isApprovalAddress(approverObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
            func_name: 2008,
            stage: 0,
            isApprover: true
        },
        {
            address: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
            func_name: 2009,
            stage: 1,
            isApprover: true
        },
        {
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            func_name: 2010,
            stage: 2,
            isApprover: true
        }
    ]
    */
}
```

### **call_getAccountParent(objArr)** </br >
Get a series of parent accounts by an array of objects. </br >

Return a ```Promise``` type of object as result, contains address & parent address values.

* objArr: An array of objects which contains account type and role info. Each object have 3 attributes: addr, func_name, stage. 
    * addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
let approverObjs = 
    [
        {
            addr: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', //EVE
        },
        {
            addr: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL', //FERDIE
        },
        {
            addr: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', //DAVE
        }
    ];

async function sample() {
    let resultObj = await call_getAccountParent(approverObjs);

    console.log(resultObj);
    /* output: [
        {
            address: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
            parentAddr: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
        },
        {
            address: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
            parentAddr: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
        },
        {
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            parentAddr: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'
        }
    ]
    */
}
```

### **call_getBalance()** </br >
Get the balance of the executed contract. </br >

Return an ```Object``` type result contains contract balance. 

```javascript
async function sample() {
    let resultObj = call_getBalance();

    console.log(resultObj);
    // output: { balance: 100000000000000000 }
}
```

### **default_transfer(addr)** </br >
Transfer 1000000000000000 coins from Bob to default account by address. </br >

Return a ```string``` type transaction hash. </br >

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let txHash = default_transfer('5GxJ7K3G4jo7kGhsvqeXhATPA55gRH7JQocD258yyAKuudqB'); //JANE

    // output: Submitted with hash 0xc15253c38b8fc257291e7120ef7cc549d9b9137f055ca7616928d4a8f2d6c22a
}
```

### **get_account_balance(addr)** </br >
Check account balance by address. </br >

Print out balance. No return value. </br >

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    get_account_balance('5GxJ7K3G4jo7kGhsvqeXhATPA55gRH7JQocD258yyAKuudqB'); //JANE
    // output: 5GxJ7K3G4jo7kGhsvqeXhATPA55gRH7JQocD258yyAKuudqB's balance of 1000000000000000 and a nonce of 0
}
```

## Register SST Contract API
Use to register new SST or check registered SST. 

### **call_registerSST(id, addr)** </br >
Register new SST by SST id & core contract address </br >

Return a ```Promise``` type of object as result, contains sst_id & core address values.

* id: SST symbol, a ```string``` type value like "EMB"
* addr: core address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    call_registerSST('EMB', '5GxJ7K3G4jo7kGhsvqeXhATPA55gRH7JQocD258yyAKuudqB'); 
    /* output: 
    {
        sst_id: 'EMB2',
        core_addr: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM'
    }
    */
}
```

### **call_getSSTcoreAddress(id)** </br >
Get core address by SST id. </br >

Return a ```Promise``` type of object as result, contains core address values.

* id: SST symbol, a ```string``` type value like "EMB"

```javascript
async function sample() {
    call_getSSTcoreAddress('EMB'); 
    // output: { core_addr: '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' }
}
```

### **call_listSSTs()** </br >
Get list of all registered SST. </br >

Return a ```Promise``` type of array as result, contains sst_id values.

```javascript
async function sample() {
    call_listSSTs(); 
    /* output: 
        [
        { sst_id: '10' },
        { sst_id: '11' },
        { sst_id: '12' },
        { sst_id: '13' },
        { sst_id: '14' },
        { sst_id: '15' },
        { sst_id: '16' },
        { sst_id: 'EMB' },
        { sst_id: 'EMB2' }
        ]
    */
}
```

### **call_isRegistered(id)** </br >
Check if a SST is already registered by SST id. </br >

Return a ```Promise``` type of object as result, contains isRegistered (boolean) values.

* id: SST symbol, a ```string``` type value like "EMB"

```javascript
async function sample() {
    call_isRegistered('EMB'); 
    // output: { isRegistered: true }
}
```

## Core Contract API
When start a new SST issuing or exchange SST process, we mainly interact with core contract to complete the processes.

### **call_create(sst_id, sst_class, amount, holding_addr)** </br >
Create new SST and store in a holding GWAL.

Return a ```Promise``` type of object as result, contains caller, holding_addr, sst_class, amount values.

* id: SST symbol, a ```string``` type value like "EMB"
* sst_class: SST class, an ```integer``` type value like 2
* amount: SST amount will be created, a ```string``` type value like "42.90000000"
* holding_addr: holdingGWAL address, the address should already be type 2, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    const sstId = "MBR";
    const sstClass = 2;
    const amount = "42.90000000";
    const holdingGWAL = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; //ALICE

    let createdObj = await call_create(sstId, sstClass, amount, holdingGWAL);
    /* output: 
    {
        caller: '5FE43cBHUf7yzu7ahkAKnEpbg59xndM5PCwLaoe6GodQjsqd', //core contract address
        holding_addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        sst_class: 2,
        amount: '42.90000000'
    }
    */
}
```

### **call_preExchange(sst_id, sst_class, amount, holding_addr)** </br >
Transfer total amount to holdingGWAL. This won't be used when create new SST process. It's for existed SST exchange process. In later approval transfer, exchange amount will transfer corresponding sub balances from holdingGWAL to subMWALs. 

Return a ```Promise``` type of object as result, contains holding_addr, sst_class, amount values.

* sst_class: SST class, an ```integer``` type value like 2
* amount: SST amount will be created, a ```string``` type value like "42.90000000"
* holding_addr: holdingGWAL address, the address should already be type 2, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    const sstId = "MBR";
    const sstClass = 2;
    const amount = "42.90000000";
    const holdingGWAL = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"; //ALICE

    let preExObj = await call_preExchange(sstId, sstClass, amount, holdingGWAL);
    /* output: 
    {
        holding_addr: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        sst_class: 2,
        amount: '42.90000000'
    }
    */
}
```

### **call_distribute(objArr)** </br >
Distribute SST for new SST issuing process. 

Return a ```Promise``` type of array as result, contains objects with info like sub_mwal, sst_class, amount values.

* objArr: An array of objects which contains distribution info. Each object have 3 attributes: sub_mwal, class, amount. 
    * class: SST class, an ```integer``` type value like 2
    * amount: SST amount will be created, a ```string``` type value like "42.90000000"
    * sub_mwal: sub MWALs address (derived from original account address) calculate from algorithm tool, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let objArr = [{
        sub_mwal: "5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3",
        class: 2,
        amount: "2.78334518"
    },
    {
        sub_mwal: "5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f",
        class: 2,
        amount: "0.35026383"
    }];

    let distributeObjs = await call_distribute(objArr);
    /* output: 
    [
        {
            sub_mwal: '5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3',
            amount: '2.78334518',
            sst_class: 2
        },
        {
            sub_mwal: '5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f',
            amount: '0.35026383',
            sst_class: 2
        }
    ]
    */
}
```

### **call_distribute_exchange(objArr)** </br >
Distribute SST for existed SST exchange process. It is similar to distribute() in SST creation, except the check condition of distribute over. In SST creation, we only have positive balances; in here, all sub balances (positive + negative) sum up will be 0.

Return a ```Promise``` type of array as result, contains objects with info like sub_mwal, sst_class, amount values.

* objArr: An array of objects which contains distribution info. Each object have 3 attributes: sub_mwal, class, amount. 
    * class: SST class, an ```integer``` type value like 2
    * amount: SST amount will be created, a ```string``` type value like "42.90000000"
    * sub_mwal: sub MWALs address (derived from original account address) calculate from algorithm tool, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    let objArr = [{
        sub_mwal: "5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3",
        class: 2,
        amount: "2.78334518"
    },
    {
        sub_mwal: "5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f",
        class: 2,
        amount: "-0.35026383"
    }];

    let distributeObjs = await call_distribute_exchange(objArr);
    /* output: 
    [
        {
            sub_mwal: '5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3',
            amount: '2.78334518',
            sst_class: 2
        },
        {
            sub_mwal: '5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f',
            amount: '-0.35026383',
            sst_class: 2
        }
    ]
    */
}
```

### **call_executeTrade(objArr)** </br >
Write executed trades by ATS.

Return a ```Promise``` type of array as result, contains objects with info like session_id, sst_class, amount, timestamp, trade_type values.

* objArr: An array of objects which contains distribution info. Each object have 6 attributes: session_id, sst_id, sst_class, amount, timestamp, trade_type. 
    * session_id: session id, an ```integer``` type value like 1 
    * sst_id: SST symbol, a ```string``` type value like "EMB"
    * sst_class: SST class, an ```integer``` type value like 2
    * amount: SST amount will be created, a ```string``` type value like "42.90000000"
    * timestamp: timestamp of sending time from fix data, a ```string``` type value like "1597859362.079"
    * trade_type: trade type, an ```integer``` type value like 0

```javascript
async function sample() {
    let objArr = [{
        session_id: 5,
        sst_id: "EMB",
        sst_class: 2,
        amount: 100,
        timestamp: "1597859362.079",
        trade_type: 0,
    },
    {
        session_id: 6,
        sst_id: sstId,
        sst_class: sstClass,
        amount: 50,
        timestamp: "1597889362.089",
        trade_type: 1,
    }];

    let etObjs = await call_executeTrade(objArr);
    /* output: 
    [
        {
            session_id: 5,
            sst_class: 2,
            amount: '100',
            timestamp: '1597859362.079',
            trade_type: 0
        },
        {
            session_id: 6,
            sst_class: 2,
            amount: '50',
            timestamp: '1597889362.089',
            trade_type: 1
        }
    ]
    */
}
```

### **call_addSettleItem(objArr)** </br >
Add settle items prepare for settlement. You can call multiple times until all settle items are added.

Return a ```Promise``` type of array as result, contains objects with info like sub_mwal, sst_class, amount values.

* objArr: An array of objects which contains distribution info. Each object have 3 attributes: sub_mwal, class, amount. 
    * sub_mwal: sub MWALs address (derived from original account address) calculate from algorithm tool, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
    * class: SST class, an ```integer``` type value like 2
    * amount: SST amount will be created, a ```string``` type value like "42.90000000"

```javascript
async function sample() {
    let objArr = [{
        sub_mwal: "5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3",
        class: 2,
        amount: "2.78334518"
    },
    {
        sub_mwal: "5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f",
        class: 2,
        amount: "0.35026383"
    }];

    let settleItems = await call_addSettleItem(objArr);
    /* output: 
    [
        {
            sub_mwal: '5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3',
            amount: '2.78334518',
            sst_class: 2
        },
        {
            sub_mwal: '5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f',
            amount: '0.35026383',
            sst_class: 2
        }
    ]
    */
}
```

### **call_settleMWALs(session_id)** </br >
Settle all settle items in a session. 

Return a ```Promise``` type of array as result, contains objects with info like session_id, sub_mwal, sst_class, amount values.

* session_id: session id, an ```integer``` type value like 5

```javascript
async function sample() {
    let session_id = 5;

    let settlement = await call_settleMWALs(session_id);
    /* output: 
    [
        {
            session_id: 5,
            sub_mwal: '5FkHg4fC1i4AMGEN3Gh6adTYezkutdhPpPtMGZPb555r7bg3',
            amount: '2.78334518',
            sst_class: 2
        },
        {
            session_id: 5,
            sub_mwal: '5Fxxuu1Jur2QvjwghpsymaU5tWa1HrbB6ABtvNsV72FhyA4f',
            amount: '0.35026383',
            sst_class: 2
        }
    ]
    */
}
```

### **call_transferToOther(sst_id, sst_class, from_amount, to_amount, to, from)** </br >
Start transfer approval process, add it to a pending trasnfer list. 

Return a ```Promise``` type of integer value as result, indicates a new pending transfering id, ptId.

* sst_id: SST symbol, a ```string``` type value like "EMB"
* from: holdingGWAL address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* to: sub MWALs address (derived from original account address) calculate from algorithm tool, and it's a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"
* sst_class: SST class, an ```integer``` type value like 2
* from_amount: the amount of ```from``` address after transfering, a ```string``` type value like "42.90000000"
* to_amount: the amount of ```to``` address after transfering, a ```string``` type value like "42.90000000"

```javascript
async function sample() {
    let obj = {
        id: 10,
        from: ALICE,
        to: SUB1,
        class: 2,
        from_amount: "0.35026383",
        to_amount: "2.78334518",
    };

    let pt_id = await call_transferToOther(obj.id, obj.class, obj.from_amount, obj.to_amount, obj.to, obj.from);

    console.log("pt_id: " + pt_id);
    /* output: 
    pt_id: 0
    */
}
```

### **call_cancelTransferToOther(pt_id)** </br >
Cancel transfer process. Can be called before all approval processes done.

Return a ```Promise``` type of object as result, contains canceled pt_id.

* pt_id: pending transfer id, an ```integer``` type value like 0

```javascript
async function sample() {
    let pt_id = 0;

    await call_cancelTransferToOther(pt_id);
    // output: pt_id: 0
}
```

### **call_approveTransferToOther(pt_id, func_name, stage, approver, last)** </br >
Approve a pending transfer by an approver at specific stage. 

Return a ```Promise``` type of object as result, contains info like from, to, from_amount, to_amount, pt_id, func_name, stage, state values.

* pt_id: pending transfer id, an ```integer``` type value like 0
* func_name: role function name of the approver, an ```integer``` type value like 2008, 2009 or 2010
* stage: stage of approval process, an ```integer``` type value like 0
* approver: an approver account has ability to sign, use Keyring to get account from ```addFromUri()``` ex. ```new Keyring({ type: 'sr25519' }).addFromUri("//Bob")```
* last: mark as last approver means this is the final round of approval process. There's no further approval need and will transfer SST immediately after approver signs. A ```boolean``` value type, if the approver is the last one mark as ```true```; otherwise, ```false```.

```javascript
async function sample() {
    let pt_id = 0;

    const keyring = new Keyring({ type: 'sr25519' });
    const eve=keyring.addFromUri("//Eve");
    const ferdie=keyring.addFromUri("//Ferdie");
    const dave=keyring.addFromUri("//Dave");

     // call approveTransferToOther() by Eve
    let result_1 = await call_approveTransferToOther(pt_id, 2008, 0, eve, false);
    // call approveTransferToOther() by Ferdie
    let result_2 = await call_approveTransferToOther(pt_id, 2009, 1, ferdie, false);
    // call approveTransferToOther() by Dave
    let result_3 = await call_approveTransferToOther(pt_id, 2010, 2, dave, true);

    let result = {};
    result.ptId = pt_id;
    result.confirm_1 = result_1;
    result.confirm_2 = result_2;
    result.confirm_3 = result_3;

    console.log(result);
    /* output: 
        {
            ptId: 0,
            confirm_1: {
                pt_id: 0,
                func_name: 2008,
                stage: 0,
                state: '\u00008ready_for_next'
            },
            confirm_2: { 
                pt_id: 0, 
                func_name: 2009, 
                stage: 1, 
                state: '\u0000' 
            },
            confirm_3: {
                from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
                to: '5CZo3TvLZoPZCyEjxqLYuZSYozwt3SypfxfdQZH1Vsa2uVUM',
                from_amount: '30.34420966',
                to_amount: '12.55579034',
                pt_id: 0,
                func_name: 2010,
                stage: 2,
                state: '\u0000 complete'
            }
        }
    */
}
```

### **call_getDistribution()** </br >
Check all distribution for current round process. Once ```reset()``` is called, there's no distribution can be checked. 

Return a ```Promise``` type of array as result, contains object info like sub_mwal, amount, sst_class values.

```javascript
async function sample() {
    await call_getDistribution();

    /* output: 
    [
        {
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            amount: '57.71810428',
            sst_class: 2
        },
        {
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            amount: '10.20499928',
            sst_class: 2
        },
        ...
    ]
    */
}
```

### **call_getSettleItems()** </br >
Check all added settle items for current round process. Once ```reset()``` is called, there's no settle items can be checked. 

Return a ```Promise``` type of array as result, contains object info like sub_mwal, amount, sst_class values.

```javascript
async function sample() {
    await call_getSettleItems();

    /* output: 
    [
        {
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            amount: '57.71810428',
            sst_class: 2
        },
        {
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            amount: '10.20499928',
            sst_class: 2
        },
        ...
    ]
    */
}
```

### **call_getSettlements(session_id)** </br >
Check all settlements by session id. Once ```reset()``` is called, there's no settlement can be checked. 

Return a ```Promise``` type of array as result, contains object info like session_id, sub_mwal, amount, sst_class values.

* session_id: session id, an ```integer``` type value like 1 

```javascript
async function sample() {
    await call_getSettlements(10);

    /* output: 
    [
        {
            session_id: 10,
            sub_mwal: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            sst_class: 2,
            amount: '57.71810428'
        },
        {
            session_id: 10,
            sub_mwal: '5CDZ9H3nLJUzyeqWwfX3gG26urFLnaHf76ukkvKeeeuZPVMt',
            sst_class: 2,
            amount: '10.20499928'
        },
        ...
    ]
    */
}
```

### **call_getPendingTransfer(pt_id)** </br >
Check pending transfer details by pt_id. 

Return a ```Promise``` type of object as result, contains info like pt_id, to, from, from_amount, to_amount values.

* pt_id: pending transfer id, an ```integer``` type value like 1 

```javascript
async function sample() {
    await call_getPendingTransfer(0);

    /* output: 
        {
            pt_id: 0,
            from: '5FAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYHL',
            to: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
            from_amount: '0.00000000',
            to_amount: '57.71810428'
        }
    */
}
```

### **call_getExecuteTrade(session_id)** </br >
Check executed trade details by session_id. 

Return a ```Promise``` type of object as result, contains info like session_id, sst_id, sst_class, amount, timestamp, trade_type values.

* session_id: session id, an ```integer``` type value like 1 

```javascript
async function sample() {
    await call_getExecuteTrade(1);

    /* output: 
        {
            session_id: 1,
            sst_class: 2,
            amount: '100',
            timestamp: '1597859362.079',
            trade_type: 0
        }
    */
}
```

### **call_checkPendingConfirmations(pt_id)** </br >
Check how many pending confirmations left by pt_id.

Return a ```Promise``` type of integer as result, contains number like 0, 1, 2, 3

* pt_id: pending transfer id, an ```integer``` type value like 1 

```javascript
async function sample() {
    await call_checkPendingConfirmations(1);

    /* output: 
        {
            pending_confirms: 2
        }
    */
}
```

### **call_checkConfirmation(pt_id)** </br >
Check confirmation details by pt_id.

Return a ```Promise``` type of array as result, contains object info like func_name, stage, approver values.

* pt_id: pending transfer id, an ```integer``` type value like 1 

```javascript
async function sample() {
    await call_checkConfirmation(1);

    /* output: 
    [
        {
            func_name: 2008,
            stage: 0,
            approver: '5CAmHCoVhFsPXqCTCGQdTY6cmVsE3HQoh7a7CUvykVZvrYMj',
        },
        ...
    ]
    */
}
```

### **call_getGwal(addr)** </br >
Check balance of holdingGWAL by address.

Return a ```Promise``` type of string as result, contains balance value.

* addr: account address, a ```string``` type value like "5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ"

```javascript
async function sample() {
    await call_getGwal("5GKtW5CGsjSGVmVp4NsXgksAHKWAtQYb7K47kFYZBHNEpuXQ");

    // output: '100.00000000'
}
```

### **call_checkState()** </br >
Check current state value. 

Return a ```Promise``` type of object as result, contains info like state, state, symbol, pt_id values.

```javascript
async function sample() {
    await call_checkState();

    /* output: 
    {
        state: 6,
        symbol: "EMB",
        pt_id: 0,
    }
    */
}
```

### **call_reset()** </br >
Reset state and other temporary storage for next round of new issuing or exchange process.

Return a ```Promise``` type of object as result, contains info like state, state, symbol, pt_id values.

```javascript
async function sample() {
    await call_checkState();

    /* output: 
        state: 0,
        symbol: "",
        pt_id: 1,
    */
}
```