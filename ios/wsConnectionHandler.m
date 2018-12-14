#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_REMAP_MODULE(Service, wsConnectionHandler, RCTEventEmitter)

RCT_EXTERN_METHOD(connect:(NSString *)hostAddress sess:(NSString *)sess)
RCT_EXTERN_METHOD(disconnect)

@end
